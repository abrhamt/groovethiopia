scr// Shared types for the unified payment driver system.
// Each driver implements `PaymentDriver` and produces an opaque payload that
// the frontend renders either as a hosted redirect URL or as a QR code.

import type { PaymentProvider } from "@prisma/client";

/**
 * Input that every driver receives when a checkout session is initiated.
 */
export interface CheckoutDriverInput {
    /** Internal checkout session ID — used as the merchant reference (`outTradeNo`). */
    orderId: string;
    /** Amount in the smallest possible currency unit already mapped by the driver. */
    amount: number;
    /** Currency code in ISO-4217 — e.g. "USD", "ETB". */
    currency: string;
    /** Human readable description (event name, ticket type, etc). */
    description: string;
    /** Customer email (optional). */
    customerEmail?: string;
    /** Customer phone number (optional, used by Telebirr/CBEBirr). */
    customerPhone?: string;
    /** Where the provider should send its async notification. */
    notifyUrl: string;
    /** Where the provider should redirect the user on success. */
    returnUrl: string;
    /** Where the provider should redirect the user on cancel. */
    cancelUrl?: string;
    /** Free-form metadata echoed back by the webhook. */
    metadata?: Record<string, string>;
}

/**
 * Output of `createSession`. The shape differs per driver:
 *   - `redirect` drivers (Stripe, BoA) yield a hosted URL.
 *   - `qr` drivers (Telebirr, CBEBirr) yield a raw code rendered locally.
 *   - `simulated` drivers yield a fake reference for dev/demo flows.
 */
export interface CheckoutDriverOutput {
    type: "redirect" | "qr" | "simulated";
    /** External session/transaction identifier echoed in webhooks. */
    providerSessionId: string;
    /** Either a hosted URL (redirect) or a raw QR payload (qr). */
    payload: string;
    /** Optional provider-specific auxiliary data to persist. */
    aux?: Record<string, unknown>;
}

export interface WebhookVerification {
    /** True if the payload signature/checksum is valid. */
    valid: boolean;
    /** External transaction identifier (e.g. Stripe session id, Telebirr trade no). */
    providerTransactionId?: string;
    /** Internal order id (`outTradeNo`) the payment corresponds to. */
    orderId?: string;
    /** Raw body / parsed payload for idempotency ledger. */
    raw?: unknown;
    /** Free-form normalized event (used by the resolver to drive the state machine). */
    event?: Record<string, unknown>;
}

export interface PaymentDriver {
    readonly provider: PaymentProvider;
    /** True if the required API credentials are configured in env. */
    readonly enabled: boolean;
    /** Create a provider-side session. */
    createSession(input: CheckoutDriverInput): Promise<CheckoutDriverOutput>;
    /** Verify and parse an inbound webhook for this provider. */
    verifyWebhook(req: Request, rawBody: string): Promise<WebhookVerification>;
}