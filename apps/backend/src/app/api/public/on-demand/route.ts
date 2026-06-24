// POST /api/public/on-demand — submit on-demand request
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@groovethiopia/db";

const schema = z.object({
  publicUserId: z.string(),
  projectType: z.string().min(2).max(100),
  location: z.string().min(2).max(200),
  budget: z.string().max(100).optional(),
  timeline: z.string().max(100).optional(),
  description: z.string().min(20).max(5000),
  contactPhone: z.string().min(7).max(50),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const request = await prisma.onDemandRequest.create({
      data: parsed.data,
    });

    return NextResponse.json({ success: true, id: request.id });
  } catch (e) {
    console.error("[on-demand] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}