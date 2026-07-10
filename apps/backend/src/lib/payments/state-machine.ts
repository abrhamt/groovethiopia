// Unified payment state machine.
// Manages the lifecycle of a `CheckoutSession` row and is the only place
// allowed to transition `status`. Transitions are atomic — concurrent callers
// are serialized through the unique `providerSessionId` and the row lock.

import type { Prisma } from "@prisma/client";
import crypto from "crypto";
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
 * Promote a PAID session to TICKET_ISSUED. Each ticket in the quantity becomes
 * its own TicketPurchase row with a unique serial number + signed gate pass.
 * The siblings share a `groupId` so the success page can render them
 * individually.
 */
export async function issueTicketForSession(args: { sessionId: string }) {
    const session = await prisma.checkoutSession.findUnique({
        where: { id: args.sessionId },
    });
    if (!session) throw new Error(`Checkout session not found: ${args.sessionId}`);
    if (session.status !== "PAID" && session.status !== "TICKET_ISSUED") {
        throw new Error(`Cannot issue ticket for session in state ${session.status}`);
    }

    // If we already issued N tickets for this session, just return the group.
    if (session.groupId) {
        const existing = await prisma.ticketPurchase.findMany({
            where: { groupId: session.groupId },
            orderBy: { createdAt: "asc" },
        });
        if (existing.length >= session.quantity) {
            const first = existing[0];
            await prisma.checkoutSession.update({
                where: { id: session.id },
                data: {
                    status: "TICKET_ISSUED",
                    issuedAt: session.issuedAt || new Date(),
                    ticketPurchaseId: session.ticketPurchaseId || first.id,
                },
            });
            return first;
        }
    }

    // Establish the groupId for this order — shared by every sibling ticket.
    const groupId = session.groupId || crypto.randomUUID();

    const expiresAt = await computePassExpiry(session.eventId);
    const created: { id: string; serialNumber: string }[] = [];
    for (let i = 0; i < session.quantity; i++) {
        const serialNumber = await generateUniqueSerialNumber();
        // When there's no real PublicUser, omit the field so Prisma doesn't
        // try to attach a relation object.
        const data: Record<string, unknown> = {
            eventId: session.eventId,
            ticketType: session.ticketTypeLabel,
            quantity: 1,
            unitPrice: session.unitAmount,
            totalPrice: session.totalAmount,
            currency: session.currency,
            paymentRef: session.providerSessionId,
            serialNumber,
            passIssuedAt: new Date(),
            passExpiresAt: expiresAt,
            status: "CONFIRMED",
            phoneNumber: session.customerPhone || "",
            groupId,
        };
        if (session.publicUserId) {
            data.publicUserId = session.publicUserId;
        }
        const ticket = await prisma.ticketPurchase.create({ data });
        created.push({ id: ticket.id, serialNumber: ticket.serialNumber });
        // Pre-sign the gate pass payload so the success page is one-click away.
        await issueGatePass(ticket.id);
        // Ensure uniqueness when multiple tickets are minted in the same ms.
        await new Promise((r) => setTimeout(r, 2));
    }

    await prisma.checkoutSession.update({
        where: { id: session.id },
        data: {
            status: "TICKET_ISSUED",
            issuedAt: new Date(),
            ticketPurchaseId: created[0].id,
            groupId,
        },
    });

    // The first ticket is treated as the primary ticket for legacy callers.
    return prisma.ticketPurchase.findUnique({ where: { id: created[0].id } });
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