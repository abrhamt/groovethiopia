// POST /api/auth/reset-password — verify OTP + set new password
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@groovethiopia/db";
import { verifyOtp } from "@/lib/otp";

const schema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(8).max(128),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { email, code, newPassword } = parsed.data;
    const lowerEmail = email.toLowerCase();

    const result = await verifyOtp(lowerEmail, code, "PASSWORD_RESET");
    if (!result.valid) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: lowerEmail } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Invalidate all sessions
    await prisma.session.deleteMany({ where: { userId: user.id } });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[reset-password] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}