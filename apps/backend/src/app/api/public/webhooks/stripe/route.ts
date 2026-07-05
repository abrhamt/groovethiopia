// POST /api/public/webhooks/stripe — Stripe webhook receiver.

import { NextRequest, NextResponse } from "next/server";
import { stripeDriver } from "@/lib/payments/stripe";
import { resolveWebhook } from "@/app/api/public/webhooks/_resolver";

export async function POST(req: NextRequest) {
    const rawBody = await req.text();
    const verification = await stripeDriver.verifyWebhook(req, rawBody);
    if (!verification.valid || !verification.providerTransactionId) {
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const eventType = verification.event?.type as string | undefined;
    const paymentStatus = verification.event?.paymentStatus as string | undefined;
    const success =
        (eventType === "checkout.session.completed" && paymentStatus === "paid") ||
        eventType === "checkout.session.async_payment_succeeded";

    const result = await resolveWebhook({
        provider: "STRIPE",
        providerTransactionId: verification.providerTransactionId,
        orderId: verification.orderId,
        rawPayload: verification.raw,
        success: !!success,
    });

    return NextResponse.json({ received: true, ...result });
}