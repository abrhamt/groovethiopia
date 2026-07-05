// GET /api/public/gatepass/public-key
// Returns the public key (PEM) used to verify signed gate pass payloads. Edge
// devices pre-load this at startup.

import { NextResponse } from "next/server";
import { getKeys } from "@/lib/crypto";

export const dynamic = "force-dynamic";

export async function GET() {
    const { publicKeyPem } = getKeys();
    // Compute a short fingerprint for cross-checking.
    const crypto = await import("crypto");
    const fingerprint = crypto
        .createHash("sha256")
        .update(publicKeyPem)
        .digest("hex")
        .slice(0, 16)
        .toUpperCase();

    return NextResponse.json(
        {
            algorithm: "ECDSA-P256-SHA256",
            publicKey: publicKeyPem,
            fingerprint,
            issuer: "groovethiopia.com",
        },
        {
            headers: {
                "Cache-Control": "public, max-age=300",
            },
        }
    );
}