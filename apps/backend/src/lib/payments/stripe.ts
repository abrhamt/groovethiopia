// Stripe driver — international card rail.
// Acts as a pass-through to Stripe Checkout Sessions, with TTL sync matching the
// internal `expires_at` window used by the state machine.

import Stripe from "stripe";
import type {
    CheckoutDriverInput,
    CheckoutDriverOutput,
    PaymentDriver,
    WebhookVerification,
} from "./types";

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = STRIPE_SECRET?.startsWith("sk_")
    ? new Stripe(STRIPE_SECRET!, { apiVersion: "2024-09-30.acacia" as any })
    : null;

export const stripeDriver: PaymentDriver = {
    provider: "STRIPE",
    enabled: !!stripe,

    async createSession(input: CheckoutDriverInput): Promise<CheckoutDriverOutput> {
        if (!stripe) {
            throw new Error("Stripe is not configured (STRIPE_SECRET_KEY missing)");
        }

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            customer_email: input.customerEmail,
            line_items: [
                {
                    price_data: {
                        currency: input.currency.toLowerCase(),
                        product_data: {
                            name: input.description,
                        },
                        unit_amount: Math.round(input.amount * 100), // cents
                    },
                    quantity: 1,
                },
            ],
            // Stripe Session TTL matches our internal 10 minute soft-lock window.
            expires_at: Math.floor(Date.now() / 1000) + 10 * 60,
            metadata: {
                orderId: input.orderId,
                ...(input.metadata || {}),
            },
            success_url: `${input.returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: input.cancelUrl,
        });

        return {
            type: "redirect",
            providerSessionId: session.id,
            payload: session.url || "",
        };
    },

    async verifyWebhook(req: Request, rawBody: string): Promise<WebhookVerification> {
        if (!stripe || !STRIPE_WEBHOOK_SECRET) {
            return { valid: false };
        }
        const signature = req.headers.get("stripe-signature");
        if (!signature) return { valid: false };

        try {
            const event = stripe.webhooks.constructEvent(
                rawBody,
                signature,
                STRIPE_WEBHOOK_SECRET
            );
            const session = event.data.object as Stripe.Checkout.Session;
            return {
                valid: true,
                providerTransactionId: session.id,
                orderId: (session.metadata?.orderId as string) || undefined,
                raw: event,
                event: {
                    type: event.type,
                    sessionId: session.id,
                    paymentStatus: session.payment_status,
                    amountTotal: session.amount_total,
                    currency: session.currency,
                },
            };
        } catch (e) {
            console.error("[stripe:webhook] verification failed", e);
            return { valid: false };
        }
    },
};

export type { Stripe };