// Driver registry — single source of truth for resolving a payment provider by
// name. Adding a new gateway means adding the import + map entry below.

import type { PaymentProvider } from "@prisma/client";
import type { PaymentDriver } from "./types";
import { stripeDriver } from "./stripe";
import { boaDriver } from "./boa";
import { telebirrDriver } from "./telebirr";
import { cbebirrDriver } from "./cbebirr";
import { simulatedDriver, chapaDriver } from "./simulated";

const drivers: Record<PaymentProvider, PaymentDriver> = {
    STRIPE: stripeDriver,
    BOA: boaDriver,
    TELEBIRR: telebirrDriver,
    CBEBIRR: cbebirrDriver,
    SIMULATED: simulatedDriver,
    CHAPA: chapaDriver,
};

export function getDriver(provider: PaymentProvider): PaymentDriver {
    const driver = drivers[provider];
    if (!driver) {
        throw new Error(`No payment driver registered for provider: ${provider}`);
    }
    return driver;
}

export function getEnabledDrivers(): PaymentDriver[] {
    return Object.values(drivers).filter((d) => d.enabled);
}

export type { PaymentDriver } from "./types";
export * from "./types";