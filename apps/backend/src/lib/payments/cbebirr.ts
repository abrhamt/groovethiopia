// CBEBirr driver — CBE Birr (Commercial Bank of Ethiopia) mobile wallet rail.
// Server-to-server call returns a raw QR string which the frontend renders.

import crypto from "crypto";
import type {
    CheckoutDriverInput,
    CheckoutDriverOutput,
    PaymentDriver,
    WebhookVerification,
} from "./types";

const CBE_MERCHANT_ID = process.env.CBE_MERCHANT_ID;
const CBE_API_KEY = process.env.CBE_API_KEY;
const CBE_API_URL = process.env.CBE_API_URL ||
    "https://api.cbebirr.com/v1/payments/create";

export const cbebirrDriver: PaymentDriver = {
    provider: "CBEBIRR",
    enabled: !!CBE_MERCHANT_ID && !!CBE_API_KEY,

    async createSession(input: CheckoutDriverInput): Promise<CheckoutDriverOutput> {
        if (!CBE_MERCHANT_ID || !CBE_API_KEY) {
            throw new Error("CBEBirr is not configured (CBE_MERCHANT_ID/CBE_API_KEY)");
        }

        // CBEBirr uses a signed request with merchant ID + timestamp + body hash.
        const timestamp = Date.now().toString();
        const body = JSON.stringify({
            merchantId: CBE_MERCHANT_ID,
            outTradeNo: input.orderId,
            totalAmount: input.amount.toFixed(2),
            subject: input.description,
            notifyUrl: input.notifyUrl,
            returnUrl: input.returnUrl,
        });
        const signature = crypto
            .createHmac("sha256", CBE_API_KEY)
            .update(timestamp + body)
            .digest("hex");

        // In dev: emit a deterministic QR string that the frontend can render.
        // In production: POST to CBE_API_URL and use the returned `qrCode` field.
        const qrPayload = JSON.stringify({
            v: "1",
            type: "cbebirr.h5",
            merchantId: CBE_MERCHANT_ID,
            outTradeNo: input.orderId,
            totalAmount: input.amount.toFixed(2),
            subject: input.description,
            notifyUrl: input.notifyUrl,
            returnUrl: input.returnUrl,
            timestamp,
            signature,
        });

        return {
            type: "qr",
            providerSessionId: input.orderId,
            payload: qrPayload,
            aux: {
                apiUrl: CBE_API_URL,
                timestamp,
            },
        };
    },

    async verifyWebhook(req: Request, rawBody: string): Promise<WebhookVerification> {
        try {
            const parsed = JSON.parse(rawBody);
            const orderId: string | undefined = parsed.outTradeNo || parsed.out_trade_no;
            const tradeNo: string | undefined = parsed.transactionId || parsed.trade_no || orderId;
            const status: string = (parsed.status || parsed.result || "").toString().toUpperCase();
            const success = status === "SUCCESS" || status === "COMPLETED" || status === "PAID";

            // Verify signature if CBE_API_KEY is configured.
            if (CBE_API_KEY && parsed.timestamp && parsed.signature) {
                const expected = crypto
                    .createHmac("sha256", CBE_API_KEY)
                    .update(parsed.timestamp + rawBody.replace(/"signature"\s*:\s*"[^"]+"/, ""))
                    .digest("hex");
                if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parsed.signature))) {
                    return { valid: false };
                }
            }

            return {
                valid: true,
                providerTransactionId: tradeNo,
                orderId,
                raw: parsed,
                event: {
                    type: "cbebirr.notify",
                    success,
                    amount: parseFloat(parsed.totalAmount || parsed.amount || "0"),
                    currency: parsed.currency || "ETB",
                    transactionId: tradeNo,
                    status,
                },
            };
        } catch (e) {
            console.error("[cbebirr:webhook] parse failed", e);
            return { valid: false };
        }
    },
};