// GET /api/admin/content — list all content (admin)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@groovethiopia/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const mine = searchParams.get("mine") === "true";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (mine) where.authorId = session.user.id;
    if (session.user.role === "EDITOR") {
      // Editors see their own drafts + all published
      where.OR = [
        { authorId: session.user.id },
        { status: "PUBLISHED" },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.content.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          author: { select: { name: true, email: true } },
          reviewer: { select: { name: true, email: true } },
          media: { take: 1, orderBy: { createdAt: "asc" } },
        },
      }),
      prisma.content.count({ where }),
    ]);

    return NextResponse.json({
      items: items.map((c) => ({
        ...c,
        price: c.price?.toString(),
      })),
      total,
      limit,
      offset,
    });
  } catch (e) {
    console.error("[admin/content] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}