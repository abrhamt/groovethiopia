// PATCH/DELETE /api/admin/gate-devices/[id]
// Update status (activate / deactivate) or remove a device.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@groovethiopia/db";
import { auth } from "@/lib/auth";

const patchSchema = z.object({
    name: z.string().min(2).max(80).optional(),
    venue: z.string().nullable().optional(),
    status: z.enum(["PROVISIONED", "ACTIVE", "DEACTIVATED"]).optional(),
});

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid input", details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    const { id } = await params;
    const updated = await prisma.gateDevice.update({
        where: { id },
        data: parsed.data,
    });
    return NextResponse.json({ device: updated });
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.gateDevice.delete({ where: { id } });
    return NextResponse.json({ success: true });
}