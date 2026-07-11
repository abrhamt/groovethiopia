// GET /api/public/checkout/status/[id]
// Polled by the frontend during the booking & polling loop. Returns the current
// state of a `CheckoutSession` and every ticket in the order group.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@groovethiopia/db";
import { expireSession } from "@/lib/payments/state-machine";
import { issueGatePass } from "@/lib/gatepass/issue";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await prisma.checkoutSession.findUnique({
            where: { id },
        });

        if (!session) {
            return NextResponse.json({ error: "Checkout session not found" }, { status: 404 });
        }

        // Auto-expire if TTL elapsed and not yet PAID.
        if (
            session.expiresAt < new Date() &&
            (session.status === "INITIATED" || session.status === "PENDING_PAYMENT")
        ) {
            await expireSession(id);
        }

        // Lazy issuance when state is PAID but ticket not yet created.
        if (
            (session.status === "PAID" || session.status === "TICKET_ISSUED") &&
            !session.groupId
        ) {
            const { issueTicketForSession } = await import("@/lib/payments/state-machine");
            await issueTicketForSession({ sessionId: id });
        }

        // Pull every sibling ticket in the order group.
        const tickets = session.groupId
            ? await prisma.ticketPurchase.findMany({
                  where: { groupId: session.groupId },
                  orderBy: { createdAt: "asc" },
              })
            : [];

        // Pre-sign the gate pass for every ticket so the success page is
        // one-click away regardless of how many were purchased.
        const passes: Array<{
            ticketId: string;
            serialNumber: string;
            ticketType: string;
            qrPayloadBase64: string;
            payload: any;
            publicKey: string;
            event: any;
            phoneNumber: string;
        }> = [];
        for (const t of tickets) {
            try {
                const pass = await issueGatePass(t.id);
                passes.push({
                    ticketId: t.id,
                    serialNumber: t.serialNumber,
                    ticketType: t.ticketType,
                    qrPayloadBase64: pass.qrPayloadBase64,
                    payload: pass.payload,
                    publicKey: pass.publicKey,
                    event: pass.ticket?.event ?? null,
                    phoneNumber: t.phoneNumber,
                });
            } catch (e) {
                console.error("[checkout/status] gate pass issuance failed", e);
            }
        }

        return NextResponse.json({
            id: session.id,
            status: session.status,
            paymentProvider: session.paymentProvider,
            providerSessionId: session.providerSessionId,
            expiresAt: session.expiresAt,
            paidAt: session.paidAt,
            issuedAt: session.issuedAt,
            quantity: session.quantity,
            groupId: session.groupId,
            tickets: tickets.map((t) => ({
                id: t.id,
                serialNumber: t.serialNumber,
                ticketType: t.ticketType,
                status: t.status,
                passExpiresAt: t.passExpiresAt,
            })),
            passes,
        });
    } catch (e: any) {
        console.error("[checkout/status] error", e);
        return NextResponse.json({ error: "Status lookup failed" }, { status: 500 });
    }
}
