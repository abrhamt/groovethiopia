// POST /api/public/inquiry — submit contact form (requires Google OAuth)
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@groovethiopia/db";
import { inngest } from "@/lib/inngest";

const schema = z.object({
  division: z.enum(["EVENTS", "TRADING", "REAL_ESTATE", "GENERAL"]),
  name: z.string().min(2).max(100),
  organization: z.string().max(200).optional(),
  email: z.string().email().max(255),
  phone: z.string().max(50).optional(),
  message: z.string().min(10).max(5000),
  metadata: z.record(z.any()).optional(),
  recaptchaToken: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;

    // Light rate-limit by IP
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const recent = await prisma.inquiry.count({
      where: {
        ipAddress: ip,
        createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });
    if (recent >= 5) {
      return NextResponse.json({ error: "Too many submissions, please try later" }, { status: 429 });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        division: data.division,
        name: data.name,
        organization: data.organization,
        email: data.email,
        phone: data.phone,
        message: data.message,
        metadata: data.metadata,
        ipAddress: ip,
        userAgent: req.headers.get("user-agent") || undefined,
      },
    });

    await inngest.send({
      name: "inquiry/created",
      data: { inquiryId: inquiry.id, division: data.division },
    });

    return NextResponse.json({ success: true, id: inquiry.id });
  } catch (e) {
    console.error("[public/inquiry] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}