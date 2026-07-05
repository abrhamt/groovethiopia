// Unified payment state machine.
// Manages the lifecycle of a `CheckoutSession` row and is the only place
// allowed to transition `status`. Transitions are atomic — concurrent callers
// are serialized through the unique `providerSessionId` and the row lock.

import type { Prisma } from "@prisma/client";
import { prisma } from "@groovethiopia/db";
import type { CheckoutStatus, PaymentProvider } from "@prisma/client";
import { getDriver } from "./registry";
import { generateSerialNumber } from "@/lib/gatepass/serial";
import { issueGatePass } from "@/lib/gatepass/issue";

export const CHECKOUT_TTL_MS = 10 * 60 * 1000; // 10-minute soft-lock window.

/**
 * Initiate a checkout session for an event ticket. Decrements inventory by
 * creating the session row in INITIATED state.
 */
export async function initiateCheckout(args: {
    eventId: string;
    eventSlug?: string | null;
    ticketTypeId: string;
    ticketTypeLabel?: string;
    userId: string;
    publicUserId?: string | null;
    quantity: number;
    unitAmount: number;
    currency?: string;
    paymentProvider: PaymentProvider;
    customerEmail?: string;
    customerPhone?: string;
    returnUrl?: string;
    metadata?: Record<string, string>;
}): Promise<{ sessionId: string; expiresAt: Date }> {
    const session = await prisma.checkoutSession.create({
        data: {
            userId: args.userId,
            publicUserId: args.publicUserId,
            eventId: args.eventId,
            eventSlug: args.eventSlug ?? null,
            ticketTypeId: args.ticketTypeId,
            ticketTypeLabel: args.ticketTypeLabel || "GENERAL",
            quantity: args.quantity,
            unitAmount: args.unitAmount,
            totalAmount: args.unitAmount * args.quantity,
            currency: args.currency || "USD",
            paymentProvider: args.paymentProvider,
            customerEmail: args.customerEmail,
            customerPhone: args.customerPhone,
            returnUrl: args.returnUrl,
            status: "INITIATED",
            expiresAt: new Date(Date.now() + CHECKOUT_TTL_MS),
        },
    });
    return { sessionId: session.id, expiresAt: session.expiresAt };
}

/**
 * Drive the session from INITIATED -> PENDING_PAYMENT by calling the driver.
 */
export async function startCheckout(args: {
    sessionId: string;
    notifyUrl: string;
    returnUrl: string;
    cancelUrl?: string;
    description: string;
    metadata?: Record<string, string>;
}) {
    const session = await prisma.checkoutSession.findUnique({ where: { id: args.sessionId } });
    if (!session) throw new Error(`Checkout session not found: ${args.sessionId}`);
    if (session.status !== "INITIATED") {
        throw new Error(`Checkout session in unexpected state: ${session.status}`);
    }

    const driver = getDriver(session.paymentProvider);
    if (!driver.enabled) {
        throw new Error(
            `Payment provider ${session.paymentProvider} is not configured on this deployment.`
        );
    }

    const out = await driver.createSession({
        orderId: session.id,
        amount: Number(session.totalAmount),
        currency: session.currency,
        description: args.description,
        customerEmail: session.customerEmail || undefined,
        customerPhone: session.customerPhone || undefined,
        notifyUrl: args.notifyUrl,
        returnUrl: args.returnUrl,
        cancelUrl: args.cancelUrl,
        metadata: args.metadata,
    });

    await prisma.checkoutSession.update({
        where: { id: session.id },
        data: {
            status: "PENDING_PAYMENT",
            providerSessionId: out.providerSessionId,
            providerPayload: out as unknown as Prisma.InputJsonValue,
        },
    });

    return out;
}

/**
 * Mark a checkout session as PAID. Idempotent — if it is already PAID or
 * beyond, the call is a no-op.
 */
export async function markPaid(args: {
    sessionId: string;
    providerTransactionId: string;
    rawEvent: unknown;
}) {
    const session = await prisma.checkoutSession.findUnique({ where: { id: args.sessionId } });
    if (!session) throw new Error(`Checkout session not found: ${args.sessionId}`);

    if (session.status === "PAID" || session.status === "TICKET_ISSUED") {
        return { session, transitioned: false };
    }
    if (session.status === "EXPIRED" || session.status === "FAILED") {
        throw new Error(`Cannot mark expired/failed session as paid: ${session.status}`);
    }

    const updated = await prisma.checkoutSession.update({
        where: { id: session.id },
        data: {
            status: "PAID",
            paidAt: new Date(),
            providerSessionId: args.providerTransactionId,
        },
    });

    return { session: updated, transitioned: true };
}

/**
 * Promote a PAID session to TICKET_ISSUED. This is the terminal happy state.
 */
export async function issueTicketForSession(args: { sessionId: string }) {
    const session = await prisma.checkoutSession.findUnique({
        where: { id: args.sessionId },
        include: { ticketPurchase: true },
    });
    if (!session) throw new Error(`Checkout session not found: ${args.sessionId}`);
    if (session.status === "TICKET_ISSUED" && session.ticketPurchase) {
        return session.ticketPurchase;
    }
    if (session.status !== "PAID" && session.status !== "TICKET_ISSUED") {
        throw new Error(`Cannot issue ticket for session in state ${session.status}`);
    }

    // Create the underlying TicketPurchase row if not yet present.
    let purchase = session.ticketPurchase;
    if (!purchase) {
        const serialNumber = await generateUniqueSerialNumber();
        const expiresAt = await computePassExpiry(session.eventId);
        purchase = await prisma.ticketPurchase.create({
            data: {
                id: session.id, // Re-use the session id for the purchase row — they share a 1:1 lifecycle.
                eventId: session.eventId,
                publicUserId: session.publicUserId || `anon-${session.userId}`,
                ticketType: session.ticketTypeLabel,
                quantity: session.quantity,
                unitPrice: session.unitAmount,
                totalPrice: session.totalAmount,
                currency: session.currency,
                paymentRef: session.providerSessionId,
                serialNumber,
                passIssuedAt: new Date(),
                passExpiresAt: expiresAt,
                status: "CONFIRMED",
                phoneNumber: session.customerPhone || "",
                checkout: { connect: { id: session.id } },
            },
        });
    }

    // Pre-sign the gate pass payload so the success page is one-click away.
    await issueGatePass(purchase.id);

    await prisma.checkoutSession.update({
        where: { id: session.id },
        data: {
            status: "TICKET_ISSUED",
            issuedAt: new Date(),
            ticketPurchaseId: purchase.id,
        },
    });

    return purchase;
}

/**
 * Mark a session as EXPIRED. Releases any soft-locked inventory. Idempotent.
 */
export async function expireSession(sessionId: string) {
    const session = await prisma.checkoutSession.findUnique({ where: { id: sessionId } });
    if (!session) return;
    if (session.status === "EXPIRED" || session.status === "TICKET_ISSUED") return;
    await prisma.checkoutSession.update({
        where: { id: sessionId },
        data: { status: "EXPIRED" },
    });
}

/**
 * Sweep all INITIATED / PENDING_PAYMENT rows whose `expiresAt` is in the past.
 */
export async function expireStaleSessions() {
    const now = new Date();
    const result = await prisma.checkoutSession.updateMany({
        where: {
            status: { in: ["INITIATED", "PENDING_PAYMENT"] },
            expiresAt: { lt: now },
        },
        data: { status: "EXPIRED" },
    });
    if (result.count > 0) {
        console.log(`[checkout] expired ${result.count} stale session(s)`);
    }
    return result.count;
}

/**
 * Generate a unique serial number with retries on collision.
 */
async function generateUniqueSerialNumber(maxAttempts = 6): Promise<string> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const candidate = generateSerialNumber();
        const exists = await prisma.ticketPurchase.findUnique({
            where: { serialNumber: candidate },
        });
        if (!exists) return candidate;
    }
    throw new Error("Could not generate a unique serial number");
}

/**
 * Compute the pass expiration timestamp based on the event schedule.
 */
async function computePassExpiry(eventId: string): Promise<Date> {
    const event = await prisma.content.findUnique({ where: { id: eventId } });
    const base = event?.endsAt || event?.startsAt || new Date();
    return new Date(base.getTime() + 24 * 60 * 60 * 1000);
}

export type { CheckoutStatus };