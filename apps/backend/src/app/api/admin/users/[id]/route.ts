// PATCH /api/admin/users/[id] — approve/deactivate user, change role
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@groovethiopia/db";
import { auth } from "@/lib/auth";

const schema = z.object({
  action: z.enum(["APPROVE", "DEACTIVATE", "CHANGE_ROLE"]),
  role: z.enum(["ADMIN", "EDITOR"]).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const data: any = {};
    if (parsed.data.action === "APPROVE") {
      data.status = "ACTIVE";
      data.approvedAt = new Date();
      data.approvedById = session.user.id;
    } else if (parsed.data.action === "DEACTIVATE") {
      data.status = "DEACTIVATED";
    } else if (parsed.data.action === "CHANGE_ROLE" && parsed.data.role) {
      data.role = parsed.data.role;
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, status: true, role: true },
    });

    return NextResponse.json({ success: true, user });
  } catch (e) {
    console.error("[admin/users PATCH] error", e);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}