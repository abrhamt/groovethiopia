// POST /api/public/webhooks/cbebirr — CBE Birr async notification.

import { NextRequest, NextResponse } from "next/server";
import { cbebirrDriver } from "@/lib/payments/cbebirr";
import { resolveWebhook } from "@/app/api/public/webhooks/_resolver";

export async function POST(req: NextRequest) {
    const rawBody = await req.text();
    const verification = await cbebirrDriver.verifyWebhook(req, rawBody);
    if (!verification.valid || !verification.providerTransactionId) {
        return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
    }

    const success = !!(verification.event?.success);
    const result = await resolveWebhook({
        provider: "CBEBIRR",
        providerTransactionId: verification.providerTransactionId,
        orderId: verification.orderId,
        rawPayload: verification.raw,
        success,
    });

    return NextResponse.json({ received: true, ...result });
}