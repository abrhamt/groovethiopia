// Bank of Abyssinia (BoA) driver — local card rail.
// Uses the merchant-hosted redirect endpoint. The signature/checksum is
// validated in `verifyWebhook` (or in the return-URL handler when the user is
// redirected back).

import crypto from "crypto";
import type {
    CheckoutDriverInput,
    CheckoutDriverOutput,
    PaymentDriver,
    WebhookVerification,
} from "./types";

const BOA_MERCHANT_ID = process.env.BOA_MERCHANT_ID;
const BOA_ACCESS_CODE = process.env.BOA_ACCESS_CODE;
const BOA_SECRET_KEY = process.env.BOA_SECRET_KEY;
const BOA_CHECKOUT_URL = process.env.BOA_CHECKOUT_URL ||
    "https://secure.abyssiniasoftware.com/payment/Checkout";

export const boaDriver: PaymentDriver = {
    provider: "BOA",
    enabled: !!BOA_MERCHANT_ID && !!BOA_ACCESS_CODE && !!BOA_SECRET_KEY,

    async createSession(input: CheckoutDriverInput): Promise<CheckoutDriverOutput> {
        if (!BOA_MERCHANT_ID || !BOA_ACCESS_CODE || !BOA_SECRET_KEY) {
            throw new Error("BoA is not configured (BOA_MERCHANT_ID/BOA_ACCESS_CODE/BOA_SECRET_KEY)");
        }

        const amount = input.amount.toFixed(2);
        const currency = input.currency.toUpperCase();

        // Build the signed payload per the BoA / CyberSource hosted page spec.
        const params: Record<string, string> = {
            merchant_id: BOA_MERCHANT_ID,
            access_code: BOA_ACCESS_CODE,
            order_id: input.orderId,
            amount,
            currency,
            description: input.description,
            customer_email: input.customerEmail || "",
            customer_phone: input.customerPhone || "",
            notify_url: input.notifyUrl,
            return_url: input.returnUrl,
            cancel_url: input.cancelUrl || input.returnUrl,
            transaction_type: "sale",
        };

        // Compute HMAC-SHA256 checksum.
        const checksum = computeChecksum(params, BOA_SECRET_KEY);
        params.checksum = checksum;

        // Build redirect URL with form-encoded query string.
        const query = new URLSearchParams(params).toString();
        const url = `${BOA_CHECKOUT_URL}?${query}`;

        return {
            type: "redirect",
            providerSessionId: input.orderId,
            payload: url,
            aux: { merchantId: BOA_MERCHANT_ID },
        };
    },

    async verifyWebhook(req: Request, rawBody: string): Promise<WebhookVerification> {
        if (!BOA_SECRET_KEY) return { valid: false };

        // BoA returns a URL-encoded form body. Verify the checksum.
        let params: Record<string, string>;
        try {
            params = Object.fromEntries(new URLSearchParams(rawBody));
        } catch {
            // Try to parse as query-string (some providers put it on the URL).
            params = Object.fromEntries(new URLSearchParams(rawBody.split("?")[1] || rawBody));
        }

        const receivedChecksum = params.checksum;
        if (!receivedChecksum) return { valid: false };

        // Verify checksum.
        const { checksum, ...rest } = params;
        const expected = computeChecksum(rest, BOA_SECRET_KEY);
        if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(receivedChecksum))) {
            return { valid: false };
        }

        const status = (params.status || params.response_code || "").toUpperCase();
        const successCodes = ["SUCCESS", "APPROVED", "00", "200"];

        return {
            valid: true,
            providerTransactionId: params.transaction_id || params.order_id,
            orderId: params.order_id,
            raw: params,
            event: {
                type: "boa.notification",
                success: successCodes.includes(status),
                amount: parseFloat(params.amount || "0"),
                currency: params.currency,
                transactionId: params.transaction_id,
                status,
            },
        };
    },
};

function computeChecksum(params: Record<string, string>, secret: string): string {
    // Sort alphabetically, join with `=`, append secret at the end with `=`.
    const sorted = Object.keys(params)
        .filter((k) => k !== "checksum" && params[k] !== undefined && params[k] !== null)
        .sort()
        .map((k) => `${k}=${params[k]}`)
        .join("&");
    return crypto.createHmac("sha256", secret).update(sorted).digest("hex");
}