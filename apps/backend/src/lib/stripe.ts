// Stripe integration — checkout sessions for tickets + webhooks
import Stripe from "stripe";
import { prisma } from "@groovethiopia/db";

const stripeSecret = process.env.STRIPE_SECRET_KEY;

// In production: use real Stripe. In dev: simulate.
export const stripeEnabled = !!stripeSecret && stripeSecret.startsWith("sk_");

export const stripe = stripeEnabled
  ? new Stripe(stripeSecret!, { apiVersion: "2024-09-30.acacia" as any })
  : null;

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export type CheckoutLineItem = {
  name: string;
  description?: string;
  amountUsd: number;
  quantity: number;
};

export type CheckoutSessionResult =
  | { type: "stripe"; sessionId: string; url: string }
  | { type: "simulated"; paymentRef: string };

/**
 * Create a checkout session for ticket purchase.
 * Returns either a Stripe Checkout URL or a simulated payment reference.
 */
export async function createCheckoutSession(args: {
  eventId: string;
  eventTitle: string;
  publicUserId: string;
  ticketType: string;
  unitPrice: number;
  quantity: number;
  currency?: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  paymentMethod?: string;
}): Promise<CheckoutSessionResult> {
  const totalAmount = args.unitPrice * args.quantity;
  const method = args.paymentMethod || "simulated";

  if (method !== "stripe" || !stripe) {
    // Simulated checkout for dev/demo
    const paymentRef = `${method}_sim_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    console.log(`[stripe:simulated] Would charge ${totalAmount} ${args.currency || "USD"} via ${method} for ${args.quantity}x ${args.ticketType} (${args.eventTitle}) — ref ${paymentRef}`);
    return { type: "simulated", paymentRef };
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: args.customerEmail,
    line_items: [
      {
        price_data: {
          currency: (args.currency || "USD").toLowerCase(),
          product_data: {
            name: `${args.eventTitle} — ${args.ticketType}`,
            description: args.quantity > 1 ? `${args.quantity} tickets` : undefined,
          },
          unit_amount: Math.round(args.unitPrice * 100), // cents
        },
        quantity: args.quantity,
      },
    ],
    metadata: {
      eventId: args.eventId,
      publicUserId: args.publicUserId,
      ticketType: args.ticketType,
      quantity: args.quantity.toString(),
    },
    success_url: `${args.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: args.cancelUrl,
  });

  return { type: "stripe", sessionId: session.id, url: session.url! };
}

/**
 * Verify and parse a Stripe webhook event.
 */
export function verifyWebhook(payload: string, signature: string): Stripe.Event | null {
  if (!stripe || !WEBHOOK_SECRET) return null;
  try {
    return stripe.webhooks.constructEvent(payload, signature, WEBHOOK_SECRET);
  } catch (e) {
    console.error("[stripe:webhook] verification failed", e);
    return null;
  }
}

/**
 * Process a successful checkout — create the ticket purchase record.
 */
export async function processCheckoutComplete(session: Stripe.Checkout.Session) {
  const { eventId, publicUserId, ticketType, quantity } = session.metadata || {};
  if (!eventId || !publicUserId) {
    console.warn("[stripe] checkout complete without metadata");
    return;
  }

  const qty = parseInt(quantity || "1");
  const event = await prisma.content.findUnique({ where: { id: eventId } });
  if (!event) return;

  const ticketPrice = event.ticketPrice ? Number(event.ticketPrice) : 0;

  await prisma.ticketPurchase.create({
    data: {
      eventId,
      publicUserId,
      ticketType: ticketType || "GENERAL",
      quantity: qty,
      unitPrice: ticketPrice,
      totalPrice: ticketPrice * qty,
      currency: session.currency?.toUpperCase() || "USD",
      paymentRef: session.id,
      serialNumber: `GT-TKT-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      status: "CONFIRMED",
      phoneNumber: "", // Could pull from publicUser if needed
    },
  });
}

/**
 * Process simulated checkout (dev mode) — same as processCheckoutComplete but no Stripe session.
 */
export async function processSimulatedCheckout(args: {
  paymentRef: string;
  eventId: string;
  publicUserId: string;
  ticketType: string;
  quantity: number;
  phoneNumber?: string;
}) {
  const event = await prisma.content.findUnique({ where: { id: args.eventId } });
  if (!event) return;

  const ticketPrice = event.ticketPrice ? Number(event.ticketPrice) : 0;

  await prisma.ticketPurchase.create({
    data: {
      eventId: args.eventId,
      publicUserId: args.publicUserId,
      ticketType: args.ticketType,
      quantity: args.quantity,
      unitPrice: ticketPrice,
      totalPrice: ticketPrice * args.quantity,
      currency: "USD",
      paymentRef: args.paymentRef,
      serialNumber: `GT-TKT-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      status: "CONFIRMED",
      phoneNumber: args.phoneNumber || "",
    },
  });
}