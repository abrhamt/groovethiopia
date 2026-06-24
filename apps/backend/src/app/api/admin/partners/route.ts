// POST /api/admin/partners — create partner
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@groovethiopia/db";
import { auth } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2),
  tier: z.enum(["STRATEGIC", "CULTURAL", "MEDIA"]),
  description: z.string().optional(),
  websiteUrl: z.string().url().optional(),
  isFeatured: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const partner = await prisma.partner.create({ data: parsed.data });
    return NextResponse.json({ success: true, partner });
  } catch (e) {
    console.error("[partners] error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}