// POST /api/public/checkout/confirm/[id]
// Used by the simulated / Chapa demo flows to mark a checkout as PAID without
// waiting for a real provider webhook. Idempotent.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@groovethiopia/db";
import { markPaid, issueTicketForSession } from "@/lib/payments/state-machine";

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const session = await prisma.checkoutSession.findUnique({ where: { id } });
        if (!session) {
            return NextResponse.json({ error: "Checkout session not found" }, { status: 404 });
        }

        if (session.paymentProvider !== "SIMULATED" && session.paymentProvider !== "CHAPA") {
            return NextResponse.json(
                { error: "Only simulated/chapa sessions can be confirmed via this endpoint" },
                { status: 400 }
            );
        }

        await markPaid({
            sessionId: id,
            providerTransactionId: session.providerSessionId || id,
            rawEvent: { source: "manual_confirm" },
        });

        const ticket = await issueTicketForSession({ sessionId: id });

        return NextResponse.json({
            success: true,
            sessionId: id,
            status: "TICKET_ISSUED",
            ticketId: ticket.id,
            serialNumber: ticket.serialNumber,
        });
    } catch (e: any) {
        console.error("[checkout/confirm] error", e);
        return NextResponse.json({ error: e.message || "Confirm failed" }, { status: 500 });
    }
}