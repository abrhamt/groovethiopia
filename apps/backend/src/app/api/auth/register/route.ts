// POST /api/auth/register — initiate registration with OTP
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@groovethiopia/db";
import { generateAndSendOtp } from "@/lib/otp";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { name, email, password } = parsed.data;
    const lowerEmail = email.toLowerCase();

    // Check if already exists
    const existing = await prisma.user.findUnique({ where: { email: lowerEmail } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // Hash password and create user (status: PENDING_APPROVAL)
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email: lowerEmail,
        passwordHash,
        role: "EDITOR",
        status: "PENDING_APPROVAL",
      },
    });

    // Send OTP
    await generateAndSendOtp(lowerEmail, user.id, "REGISTRATION");

    return NextResponse.json({
      success: true,
      message: "OTP sent. Verify your email to complete registration.",
      userId: user.id,
    });
  } catch (e) {
    console.error("[register] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}