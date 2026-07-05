// POST /api/public/gatepass/verify — Optional server-side verification.
// Most verification happens on the edge device, but this endpoint lets an
// operator validate a payload from a phone or alternative client.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@groovethiopia/db";
import { verifyPayload } from "@/lib/crypto";
import { authenticateDevice } from "@/lib/gatepass/device-auth";
import { verifySerialChecksum } from "@/lib/gatepass/serial";

const schema = z.object({
    payload: z.object({
        iss: z.string(),
        sub: z.string(),
        sn: z.string(),
        exp: z.number(),
        sig: z.string(),
    }),
});

export async function POST(req: NextRequest) {
    const auth = await authenticateDevice(req);
    if ("error" in auth) return auth.error;

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid input", details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    const { payload } = parsed.data;
    const now = Math.floor(Date.now() / 1000);

    // 1. Cryptographic signature check.
    const { sig, ...unsigned } = payload;
    const sigValid = verifyPayload(unsigned, sig);

    if (!sigValid) {
        return NextResponse.json(
            { decision: "DENY", reason: "INVALID_SIGNATURE" },
            { status: 200 }
        );
    }

    // 2. Expiration check.
    if (payload.exp < now) {
        return NextResponse.json(
            { decision: "DENY", reason: "EXPIRED", expiredAt: payload.exp },
            { status: 200 }
        );
    }

    // 3. Serial number checksum check.
    if (!verifySerialChecksum(payload.sn)) {
        return NextResponse.json(
            { decision: "DENY", reason: "INVALID_SERIAL" },
            { status: 200 }
        );
    }

    // 4. Per-device duplicate lookup.
    const existing = await prisma.gateScan.findUnique({
        where: {
            deviceId_serialNumber: {
                deviceId: auth.device.id,
                serialNumber: payload.sn,
            },
        },
    });

    if (existing) {
        return NextResponse.json(
            {
                decision: "DENY",
                reason: "ALREADY_SCANNED",
                previouslyScannedAt: existing.scannedAt,
            },
            { status: 200 }
        );
    }

    // 5. Cross-gate replay audit (informational).
    const otherScans = await prisma.gateScan.findMany({
        where: { serialNumber: payload.sn, deviceId: { not: auth.device.id } },
        orderBy: { scannedAt: "asc" },
    });
    let multiGateAudit: { deviceId: string; scannedAt: string } | null = null;
    if (otherScans.length > 0) {
        const mostRecent = otherScans[otherScans.length - 1];
        multiGateAudit = {
            deviceId: mostRecent.deviceId,
            scannedAt: mostRecent.scannedAt.toISOString(),
        };
    }

    return NextResponse.json(
        {
            decision: "ALLOW",
            reason: "FRESH",
            serialNumber: payload.sn,
            subject: payload.sub,
            multiGateAudit,
        },
        { status: 200 }
    );
}