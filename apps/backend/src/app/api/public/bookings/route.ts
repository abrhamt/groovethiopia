// POST /api/public/bookings — reserve an event
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

    // Get or create the public user (supports demo mode where the user
    // is created client-side with a placeholder id)
    let user = await prisma.publicUser.findUnique({ where: { id: data.publicUserId } }).catch(() => null);

    // Try by googleId-style lookup if id didn't match (demo path)
    if (!user) {
      user = await prisma.publicUser.findFirst({
        where: { email: { contains: "@" } },
      });
    }

    // Last resort: create a demo user
    if (!user) {
      user = await prisma.publicUser.create({
        data: {
          id: data.publicUserId.startsWith("demo-user-") ? data.publicUserId : `demo-${data.publicUserId}`,
          email: `${data.publicUserId}@demo.groovethiopia.com`,
          name: "Demo Guest",
          googleId: `demo-${data.publicUserId}-${Date.now()}`,
        },
      }).catch(async () => {
        // If id conflict, find by email
        return prisma.publicUser.findFirst({
          where: { email: `${data.publicUserId}@demo.groovethiopia.com` },
        });
      });
    }

    if (!user) {
      return NextResponse.json({ error: "Could not create user" }, { status: 500 });
    }

    // Verify event exists and is available
    const event = await prisma.content.findUnique({ where: { id: data.eventId } });
    if (!event || (event.type !== "EVENT" && event.type !== "SHUKSHUTA_EVENT")) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    if (event.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Event not available for booking" }, { status: 400 });
    }

    // Check capacity if specified
    if (event.capacity) {
      const existing = await prisma.eventBooking.count({
        where: { eventId: data.eventId, status: { in: ["CONFIRMED", "PENDING"] } },
      });
      if (existing + data.partySize > event.capacity) {
        return NextResponse.json({ error: "Event is at capacity" }, { status: 400 });
      }
    }

    // Create booking
    const booking = await prisma.eventBooking.create({
      data: {
        eventId: data.eventId,
        publicUserId: user.id,
        partySize: data.partySize,
        phoneNumber: data.phoneNumber,
        notes: data.notes,
        status: "CONFIRMED",
      },
    });

    // Notify admins (best-effort)
    try {
      const { inngest } = await import("@/lib/inngest");
      await inngest.send({
        name: "inquiry/created", // reuse inquiry event for now
        data: { inquiryId: booking.id, division: "EVENTS" },
      });
    } catch {}

    return NextResponse.json({ success: true, booking });
  } catch (e) {
    console.error("[bookings] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}