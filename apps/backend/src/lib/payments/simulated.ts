// Simulated payment driver — used in dev/demo environments when no real
// gateway credentials are configured. It issues a deterministic reference and
// allows the rest of the state machine to be exercised end-to-end.

import type {
    CheckoutDriverInput,
    CheckoutDriverOutput,
    PaymentDriver,
    WebhookVerification,
} from "./types";

export const simulatedDriver: PaymentDriver = {
    provider: "SIMULATED",
    enabled: true,

    async createSession(input: CheckoutDriverInput): Promise<CheckoutDriverOutput> {
        const providerSessionId = `sim_${input.orderId}_${Date.now()}`;
        return {
            type: "simulated",
            providerSessionId,
            payload: providerSessionId,
            aux: {
                note: "Simulated checkout — no real payment was processed.",
                amount: input.amount,
                currency: input.currency,
            },
        };
    },

    async verifyWebhook(): Promise<WebhookVerification> {
        // Simulated payments are confirmed out-of-band via the
        // `/api/public/checkout/confirm/:id` endpoint, not via webhooks.
        return { valid: false };
    },
};

// Chapa is treated as a development/demo driver for now. It re-uses the
// simulated flow but lets the UI render a distinct branding.
export const chapaDriver: PaymentDriver = {
    provider: "CHAPA",
    enabled: true,

    async createSession(input: CheckoutDriverInput): Promise<CheckoutDriverOutput> {
        const providerSessionId = `chapa_${input.orderId}_${Date.now()}`;
        return {
            type: "simulated",
            providerSessionId,
            payload: providerSessionId,
            aux: { mode: "chapa", amount: input.amount, currency: input.currency },
        };
    },

    async verifyWebhook(): Promise<WebhookVerification> {
        return { valid: false };
    },
};