// Edge device authentication middleware.
// Validates the `X-Device-Key` header against the hashed API key for a known
// `GateDevice` row. Rejects deactivated devices unconditionally.

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@groovethiopia/db";

const PREFIX = "gpd_"; // Gate Pass Device key prefix.

export interface AuthenticatedDevice {
    id: string;
    hardwareId: string;
    name: string;
    venue: string | null;
}

/**
 * Hash an API key for storage and comparison.
 */
export function hashApiKey(plaintext: string): string {
    return crypto.createHash("sha256").update(plaintext).digest("hex");
}

/**
 * Generate a fresh device API key. Returns the plaintext (to share once) and
 * the prefix used to identify the key.
 */
export function generateDeviceApiKey(): { plaintext: string; prefix: string; hash: string } {
    const raw = crypto.randomBytes(24).toString("base64url");
    const plaintext = `${PREFIX}${raw}`;
    const prefix = plaintext.slice(0, 12);
    const hash = hashApiKey(plaintext);
    return { plaintext, prefix, hash };
}

/**
 * Middleware-style helper for Next.js route handlers. Returns either the
 * authenticated device or a NextResponse to be returned immediately.
 */
export async function authenticateDevice(
    req: NextRequest
): Promise<{ device: AuthenticatedDevice } | { error: NextResponse }> {
    const headerKey = req.headers.get("x-device-key");
    if (!headerKey) {
        return { error: NextResponse.json({ error: "Missing X-Device-Key header" }, { status: 401 }) };
    }

    const hash = hashApiKey(headerKey);
    const device = await prisma.gateDevice.findUnique({ where: { apiKeyHash: hash } });
    if (!device) {
        return { error: NextResponse.json({ error: "Invalid device key" }, { status: 401 }) };
    }
    if (device.status === "DEACTIVATED") {
        return { error: NextResponse.json({ error: "Device deactivated" }, { status: 403 }) };
    }

    // Update last-seen asynchronously (don't block the auth path).
    prisma.gateDevice
        .update({ where: { id: device.id }, data: { lastSeenAt: new Date() } })
        .catch(() => undefined);

    return {
        device: {
            id: device.id,
            hardwareId: device.hardwareId,
            name: device.name,
            venue: device.venue,
        },
    };
}