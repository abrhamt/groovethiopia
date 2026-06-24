// GET /api/admin/inquiries — list inquiries (admin only)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@groovethiopia/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const division = searchParams.get("division");
    const status = searchParams.get("status");

    const items = await prisma.inquiry.findMany({
      where: {
        ...(division && { division: division as any }),
        ...(status && { status: status as any }),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ items });
  } catch (e) {
    console.error("[admin/inquiries] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}