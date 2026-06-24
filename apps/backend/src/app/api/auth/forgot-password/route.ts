// POST /api/auth/forgot-password — request password reset OTP
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@groovethiopia/db";
import { generateAndSendOtp } from "@/lib/otp";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const lowerEmail = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: lowerEmail } });
    if (!user) {
      // Don't leak which emails exist
      return NextResponse.json({ success: true, message: "If account exists, OTP sent" });
    }

    await generateAndSendOtp(lowerEmail, user.id, "PASSWORD_RESET");
    return NextResponse.json({ success: true, message: "If account exists, OTP sent" });
  } catch (e) {
    console.error("[forgot-password] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}