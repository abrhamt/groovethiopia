// POST /api/public/checkout/create
// Initiate a checkout session. Returns the provider-specific payload that the
// frontend renders as either a hosted redirect URL or a dynamic payment QR.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@groovethiopia/db";
import { initiateCheckout, startCheckout } from "@/lib/payments/state-machine";
import { getEnabledDrivers } from "@/lib/payments/registry";
import type { PaymentProvider } from "@prisma/client";

const schema = z.object({
    eventId: z.string(),
    ticketType: z.string().default("GENERAL"),
    quantity: z.number().int().min(1).max(10).default(1),
    paymentProvider: z.enum([
        "STRIPE",
        "BOA",
        "TELEBIRR",
        "CBEBIRR",
        "CHAPA",
        "SIMULATED",
    ]),
    publicUserId: z.string().optional(),
    customerEmail: z.string().email().optional(),
    customerPhone: z.string().min(7).max(50).optional(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = schema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid input", details: parsed.error.flatten() },
                { status: 400 }
            );
        }
        const data = parsed.data;

        // Validate event
        const event = await prisma.content.findUnique({ where: { id: data.eventId } });
        if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
        if (event.status !== "PUBLISHED") {
            return NextResponse.json({ error: "Event not available" }, { status: 400 });
        }
        if (!event.ticketPrice || Number(event.ticketPrice) === 0) {
            return NextResponse.json(
                { error: "This event is free — use booking instead" },
                { status: 400 }
            );
        }

        // Capacity check
        if (event.capacity) {
            const existing = await prisma.eventBooking.count({
                where: { eventId: data.eventId, status: { in: ["CONFIRMED", "PENDING"] } },
            });
            const ticketSold = await prisma.ticketPurchase.aggregate({
                where: { eventId: data.eventId, status: { in: ["CONFIRMED", "PENDING"] } },
                _sum: { quantity: true },
            });
            const total = existing + (ticketSold._sum.quantity || 0);
            if (total + data.quantity > event.capacity) {
                return NextResponse.json({ error: "Event is at capacity" }, { status: 400 });
            }
        }

        // Resolve user id — public users without accounts get a synthetic id.
        const userId =
            data.publicUserId ||
            (data.customerEmail ? `email:${data.customerEmail}` : `anon:${Date.now()}`);

        // Simulated provider is a dev fallback when no real driver is configured.
        let provider = data.paymentProvider as PaymentProvider;
        if (provider !== "SIMULATED" && provider !== "CHAPA") {
            const driver = getEnabledDrivers().find((d) => d.provider === provider);
            if (!driver) {
                provider = "SIMULATED";
            }
        }

        // Initiate the session (soft-lock).
        const { sessionId, expiresAt } = await initiateCheckout({
            eventId: event.id,
            eventSlug: event.slug,
            ticketTypeId: event.id, // Treat the event itself as the "ticket type".
            ticketTypeLabel: data.ticketType,
            userId,
            publicUserId: data.publicUserId,
            quantity: data.quantity,
            unitAmount: Number(event.ticketPrice),
            currency: event.currency || "USD",
            paymentProvider: provider,
            customerEmail: data.customerEmail,
            customerPhone: data.customerPhone,
        });

        const FRONTEND = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
        const BACKEND =
            process.env.NEXT_PUBLIC_API_URL ||
            process.env.AUTH_URL ||
            "http://localhost:3002";

        // Drive the provider-specific session creation.
        const driverOutput = await startCheckout({
            sessionId,
            notifyUrl: `${BACKEND}/api/public/webhooks/${provider.toLowerCase()}`,
            returnUrl: `${FRONTEND}/en/tickets/success?session_id={CHECKOUT_SESSION_ID}&order=${sessionId}`,
            cancelUrl: `${FRONTEND}/en/events/${event.slug}`,
            description: `${event.title} — ${data.ticketType} x${data.quantity}`,
            metadata: {
                eventId: event.id,
                quantity: String(data.quantity),
            },
        });

        return NextResponse.json({
            mode: driverOutput.type,
            sessionId,
            expiresAt,
            provider,
            providerSessionId: driverOutput.providerSessionId,
            url: driverOutput.type === "redirect" ? driverOutput.payload : null,
            qrPayload: driverOutput.type === "qr" ? driverOutput.payload : null,
            paymentRef: driverOutput.providerSessionId,
        });
    } catch (e: any) {
        console.error("[checkout/create] error", e);
        return NextResponse.json({ error: e.message || "Checkout failed" }, { status: 500 });
    }
}