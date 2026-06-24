// POST /api/public/tickets/checkout — initiate ticket purchase
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@groovethiopia/db";
import { createCheckoutSession, processSimulatedCheckout, stripeEnabled } from "@/lib/stripe";

const schema = z.object({
  eventId: z.string(),
  publicUserId: z.string(),
  ticketType: z.string().default("GENERAL"),
  quantity: z.number().int().min(1).max(10).default(1),
  phoneNumber: z.string().min(7).max(50),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;

    // Validate event + capacity
    const event = await prisma.content.findUnique({ where: { id: data.eventId } });
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    if (event.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Event not available" }, { status: 400 });
    }
    if (!event.ticketPrice || Number(event.ticketPrice) === 0) {
      return NextResponse.json({ error: "This event is free — use booking instead" }, { status: 400 });
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

    // Get or create user
    let user = await prisma.publicUser.findUnique({ where: { id: data.publicUserId } }).catch(() => null);
    if (!user) {
      user = await prisma.publicUser.create({
        data: {
          id: data.publicUserId.startsWith("demo-") ? data.publicUserId : `demo-${data.publicUserId}`,
          email: `${data.publicUserId}@demo.groovethiopia.com`,
          name: "Guest",
          googleId: `sim-${data.publicUserId}-${Date.now()}`,
        },
      }).catch(() => null);
    }

    const FRONTEND = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

    // Create checkout session
    const session = await createCheckoutSession({
      eventId: event.id,
      eventTitle: event.title,
      publicUserId: user!.id,
      ticketType: data.ticketType,
      unitPrice: Number(event.ticketPrice),
      quantity: data.quantity,
      successUrl: `${FRONTEND}/${data.publicUserId.startsWith("demo-") ? "en" : "en"}/tickets/success`,
      cancelUrl: `${FRONTEND}/en/events/${event.slug}`,
      customerEmail: user!.email,
    });

    // In simulated mode, also create the ticket immediately
    if (session.type === "simulated") {
      await processSimulatedCheckout({
        paymentRef: session.paymentRef,
        eventId: event.id,
        publicUserId: user!.id,
        ticketType: data.ticketType,
        quantity: data.quantity,
      });
    }

    return NextResponse.json({
      mode: stripeEnabled ? "stripe" : "simulated",
      ...session,
      totalPrice: Number(event.ticketPrice) * data.quantity,
      currency: "USD",
    });
  } catch (e) {
    console.error("[tickets/checkout] error", e);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}