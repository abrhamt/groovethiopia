// Shared webhook resolver — used by every payment provider webhook route.
// Performs idempotency check + state machine transition.

import { withIdempotency } from "@/lib/payments/webhook-ledger";
import { markPaid, issueTicketForSession } from "@/lib/payments/state-machine";
import type { PaymentProvider } from "@prisma/client";

/**
 * Resolve a verified webhook event into state-machine transitions. Runs the
 * downstream side-effects only on the very first webhook delivery for a given
 * `(provider, transactionId)` pair.
 */
export async function resolveWebhook(args: {
    provider: PaymentProvider;
    providerTransactionId: string;
    orderId?: string;
    rawPayload: unknown;
    success: boolean;
}) {
    if (!args.success) {
        // For now we just record the attempt — failed webhooks may be retried
        // by the provider with `success: true` so we don't transition here.
        await withIdempotency(
            args.provider,
            `failed:${args.providerTransactionId}`,
            args.rawPayload,
            args.orderId,
            async () => true
        );
        return { transitioned: false, reason: "payment_not_successful" };
    }

    if (!args.orderId) {
        return { transitioned: false, reason: "missing_order_id" };
    }

    const record = await withIdempotency(
        args.provider,
        args.providerTransactionId,
        args.rawPayload,
        args.orderId,
        async () => {
            await markPaid({
                sessionId: args.orderId!,
                providerTransactionId: args.providerTransactionId,
                rawEvent: args.rawPayload,
            });
            await issueTicketForSession({ sessionId: args.orderId! });
            return true;
        }
    );

    if (!record.isNew) {
        return { transitioned: false, reason: "duplicate_webhook", result: record.result };
    }

    return { transitioned: true, result: record.result };
}