// POST /api/public/webhooks/boa — Bank of Abyssinia webhook receiver.

import { NextRequest, NextResponse } from "next/server";
import { boaDriver } from "@/lib/payments/boa";
import { resolveWebhook } from "@/app/api/public/webhooks/_resolver";

export async function POST(req: NextRequest) {
    const rawBody = await req.text();
    const verification = await boaDriver.verifyWebhook(req, rawBody);
    if (!verification.valid || !verification.providerTransactionId) {
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const success = !!(verification.event?.success);

    const result = await resolveWebhook({
        provider: "BOA",
        providerTransactionId: verification.providerTransactionId,
        orderId: verification.orderId,
        rawPayload: verification.raw,
        success,
    });

    // BoA expects a plain text "OK" or specific JSON response.
    return NextResponse.json({ received: true, ...result });
}