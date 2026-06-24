// POST /api/auth/verify-otp — verify OTP for registration or password reset
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyOtp } from "@/lib/otp";

const schema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  purpose: z.enum(["REGISTRATION", "PASSWORD_RESET", "EMAIL_CHANGE"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const result = await verifyOtp(parsed.data.email, parsed.data.code, parsed.data.purpose);
    if (!result.valid) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    return NextResponse.json({ success: true, userId: result.userId });
  } catch (e) {
    console.error("[verify-otp] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}