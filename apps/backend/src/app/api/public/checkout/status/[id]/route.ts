// GET /api/public/checkout/status/[id]
// Polled by the frontend during the booking & polling loop. Returns the current
// state of a `CheckoutSession` along with the issued ticket (if available).

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@groovethiopia/db";
import { expireSession } from "@/lib/payments/state-machine";
import { issueGatePass } from "@/lib/gatepass/issue";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const session = await prisma.checkoutSession.findUnique({
            where: { id },
            include: { ticketPurchase: true },
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
        let ticket = session.ticketPurchase;
        if (
            (session.status === "PAID" || session.status === "TICKET_ISSUED") &&
            !ticket
        ) {
            // Trigger issuance inline; the state machine creates the row.
            const { issueTicketForSession } = await import("@/lib/payments/state-machine");
            ticket = await issueTicketForSession({ sessionId: id });
        }

        let pass = null;
        if (ticket) {
            try {
                pass = await issueGatePass(ticket.id);
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
            ticket: ticket
                ? {
                    id: ticket.id,
                    serialNumber: ticket.serialNumber,
                    ticketType: ticket.ticketType,
                    quantity: ticket.quantity,
                    status: ticket.status,
                    passExpiresAt: ticket.passExpiresAt,
                }
                : null,
            pass,
        });
    } catch (e: any) {
        console.error("[checkout/status] error", e);
        return NextResponse.json({ error: "Status lookup failed" }, { status: 500 });
    }
}