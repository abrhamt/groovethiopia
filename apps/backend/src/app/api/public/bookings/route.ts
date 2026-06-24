// POST /api/public/bookings — reserve an event (requires logged-in public user)
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@groovethiopia/db";

const schema = z.object({
  eventId: z.string(),
  publicUserId: z.string(),
  partySize: z.number().int().min(1).max(20).default(1),
  phoneNumber: z.string().min(7).max(50),
  notes: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const data = parsed.data;

    // Verify user exists
    const user = await prisma.publicUser.findUnique({ where: { id: data.publicUserId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify event exists and is upcoming
    const event = await prisma.content.findUnique({
      where: { id: data.eventId },
      include: { _count: { select: { media: false } } },
    });
    if (!event || (event.type !== "EVENT" && event.type !== "SHUKSHUTA_EVENT")) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    if (event.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Event not available" }, { status: 400 });
    }

    const booking = await prisma.eventBooking.create({
      data: {
        eventId: data.eventId,
        publicUserId: data.publicUserId,
        partySize: data.partySize,
        phoneNumber: data.phoneNumber,
        notes: data.notes,
        status: "CONFIRMED",
      },
    });

    return NextResponse.json({ success: true, booking });
  } catch (e) {
    console.error("[bookings] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}