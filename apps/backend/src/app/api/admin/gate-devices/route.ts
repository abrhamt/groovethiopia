// GET/POST /api/admin/gate-devices
// Admin-only endpoints to provision and list edge devices.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@groovethiopia/db";
import { generateDeviceApiKey } from "@/lib/gatepass/device-auth";
import { auth } from "@/lib/auth";

const createSchema = z.object({
    hardwareId: z.string().min(4).max(64),
    name: z.string().min(2).max(80),
    venue: z.string().optional(),
    publicKeyFingerprint: z.string().optional(),
});

export async function GET() {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const devices = await prisma.gateDevice.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            hardwareId: true,
            name: true,
            venue: true,
            apiKeyPrefix: true,
            status: true,
            publicKeyFingerprint: true,
            lastSeenAt: true,
            createdAt: true,
            _count: {
                select: { scans: true, auditFlags: true },
            },
        },
    });

    return NextResponse.json({ devices });
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid input", details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    // Generate the device's API key once and return it — it is never stored
    // in plaintext and cannot be recovered later.
    const { plaintext, prefix, hash } = generateDeviceApiKey();

    const device = await prisma.gateDevice.create({
        data: {
            hardwareId: parsed.data.hardwareId,
            name: parsed.data.name,
            venue: parsed.data.venue,
            publicKeyFingerprint: parsed.data.publicKeyFingerprint,
            apiKeyHash: hash,
            apiKeyPrefix: prefix,
        },
        select: {
            id: true,
            hardwareId: true,
            name: true,
            venue: true,
            apiKeyPrefix: true,
            status: true,
            createdAt: true,
        },
    });

    return NextResponse.json(
        {
            device,
            apiKey: plaintext, // Returned only once. Store this securely on the device.
        },
        { status: 201 }
    );
}