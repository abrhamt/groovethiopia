// Idempotency ledger for inbound payment webhooks.
// Every webhook is recorded against `(provider, providerTransactionId)`. The
// very first time a pair is seen the wrapped handler runs and the response is
// returned to the caller. Subsequent replays of the same webhook return the
// cached response and never re-trigger downstream side-effects.

import { prisma } from "@groovethiopia/db";
import type { PaymentProvider } from "@prisma/client";

export interface LedgerRecord<T> {
    isNew: boolean;
    result?: T;
}

/**
 * Atomically deduplicate a webhook by `(provider, providerTransactionId)`.
 * Runs `handler` exactly once per unique pair and persists the raw payload.
 */
export async function withIdempotency<T>(
    provider: PaymentProvider,
    providerTransactionId: string,
    rawPayload: unknown,
    associatedOrderId: string | undefined,
    handler: () => Promise<T>
): Promise<LedgerRecord<T>> {
    // Try to insert the ledger row first. If it fails with a unique-constraint
    // violation the webhook has already been processed.
    try {
        await prisma.processedWebhook.create({
            data: {
                provider,
                providerTransactionId,
                rawPayload: (rawPayload ?? {}) as any,
                associatedOrderId,
            },
        });
    } catch (e: any) {
        if (e?.code === "P2002") {
            return { isNew: false };
        }
        throw e;
    }

    const result = await handler();
    return { isNew: true, result };
}