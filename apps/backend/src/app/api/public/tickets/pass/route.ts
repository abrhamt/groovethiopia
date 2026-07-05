// GET /api/public/tickets/pass?paymentRef=... | ?ticketId=... | ?serial=...
// Returns the signed gate pass for a purchased ticket. Backwards-compatible
// with the old `paymentRef` lookup as well as the new `serial` lookup.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@groovethiopia/db";
import { issueGatePass } from "@/lib/gatepass/issue";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const ticketId = searchParams.get("ticketId") || "";
    const paymentRef = searchParams.get("paymentRef") || "";
    const serial = searchParams.get("serial") || "";

    if (!ticketId && !paymentRef && !serial) {
      return NextResponse.json(
        { error: "Missing ticketId, paymentRef, or serial parameter" },
        { status: 400 }
      );
    }

    // Find the ticket using any of the supported identifiers.
    const ticket = await prisma.ticketPurchase.findFirst({
      where: {
        OR: [
          ...(ticketId ? [{ id: ticketId }] : []),
          ...(paymentRef ? [{ paymentRef }] : []),
          ...(serial ? [{ serialNumber: serial }] : []),
        ],
      },
      include: { publicUser: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const pass = await issueGatePass(ticket.id);
    return NextResponse.json(pass);
  } catch (error: any) {
    console.error("[tickets/pass] failed to generate pass:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}