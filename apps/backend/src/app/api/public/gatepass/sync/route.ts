// POST /api/public/gatepass/sync — Edge device scan sync endpoint.
// Receives a batch of `[serial_number, scanned_at, device_id]` records from a
// gate scanner running in offline-first mode. Implements the multi-gate replay
// conflict resolution described in the architecture document.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@groovethiopia/db";
import { authenticateDevice } from "@/lib/gatepass/device-auth";
import { verifySerialChecksum } from "@/lib/gatepass/serial";

const schema = z.object({
    scans: z
        .array(
            z.object({
                serialNumber: z.string().min(5),
                scannedAt: z.string().datetime(),
                payload: z
                    .object({
                        sub: z.string().optional(),
                        exp: z.number().optional(),
                    })
                    .optional(),
            })
        )
        .min(1)
        .max(500),
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

    const device = auth.device;
    const accepted: string[] = [];
    const duplicates: string[] = [];
    const conflicts: Array<{ serialNumber: string; existingDeviceId: string }> = [];
    const unknown: string[] = [];

    for (const scan of parsed.data.scans) {
        // Validate checksum — clients should already do this, but verify again.
        if (!verifySerialChecksum(scan.serialNumber)) {
            unknown.push(scan.serialNumber);
            continue;
        }

        // Look up the ticket by serial number.
        const ticket = await prisma.ticketPurchase.findUnique({
            where: { serialNumber: scan.serialNumber },
        });
        if (!ticket) {
            unknown.push(scan.serialNumber);
            continue;
        }

        const scannedAt = new Date(scan.scannedAt);

        // Try to insert the scan. The unique `(deviceId, serialNumber)` index
        // is what makes per-device duplicate detection atomic.
        try {
            await prisma.gateScan.create({
                data: {
                    deviceId: device.id,
                    serialNumber: scan.serialNumber,
                    ticketId: ticket.id,
                    scannedAt,
                    payloadSnapshot: scan.payload as any,
                    syncStatus: true,
                    syncedAt: new Date(),
                },
            });
            accepted.push(scan.serialNumber);
        } catch (e: any) {
            if (e?.code === "P2002") {
                duplicates.push(scan.serialNumber);
                // Mark existing row as synced since the device uploaded it.
                await prisma.gateScan.updateMany({
                    where: { deviceId: device.id, serialNumber: scan.serialNumber },
                    data: { syncStatus: true, syncedAt: new Date() },
                });
                continue;
            }
            throw e;
        }

        // Multi-gate replay detection: if another device already scanned this
        // serial number with an earlier timestamp, raise an audit flag. The
        // first scan (lowest `scannedAt`) takes precedence.
        const otherScans = await prisma.gateScan.findMany({
            where: {
                serialNumber: scan.serialNumber,
                deviceId: { not: device.id },
            },
            orderBy: { scannedAt: "asc" },
        });

        for (const prior of otherScans) {
            // Only flag if the prior scan happened within the audit window
            // (default 60 seconds) of the current scan — anything older is
            // considered a legitimate re-entry.
            const auditWindowMs = 60 * 1000;
            if (Math.abs(prior.scannedAt.getTime() - scannedAt.getTime()) < auditWindowMs) {
                await prisma.gateAudit.create({
                    data: {
                        deviceId: device.id,
                        serialNumber: scan.serialNumber,
                        conflictWithId: prior.id,
                        reason: "MULTI_GATE_REPLAY",
                        metadata: {
                            priorDeviceId: prior.deviceId,
                            priorScannedAt: prior.scannedAt.toISOString(),
                            currentScannedAt: scannedAt.toISOString(),
                            priorTakesPrecedence: prior.scannedAt < scannedAt,
                        } as any,
                    },
                });
                conflicts.push({
                    serialNumber: scan.serialNumber,
                    existingDeviceId: prior.deviceId,
                });
            }
        }
    }

    return NextResponse.json({
        accepted,
        duplicates,
        conflicts,
        unknown,
        summary: {
            total: parsed.data.scans.length,
            accepted: accepted.length,
            duplicates: duplicates.length,
            conflicts: conflicts.length,
            unknown: unknown.length,
        },
    });
}