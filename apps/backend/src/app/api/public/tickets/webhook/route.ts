// POST /api/public/tickets/webhook — Stripe webhook receiver
import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook, processCheckoutComplete } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  const payload = await req.text();
  const event = verifyWebhook(payload, sig);

  if (!event) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      await processCheckoutComplete(event.data.object as any);
      break;
    case "checkout.session.async_payment_succeeded":
      await processCheckoutComplete(event.data.object as any);
      break;
    default:
      console.log(`[stripe:webhook] unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}