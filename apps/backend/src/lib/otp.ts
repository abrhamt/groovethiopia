// OTP generation and verification for registration + password reset
import { randomInt } from "crypto";
import { prisma } from "@groovethiopia/db";
import { sendOtpEmail } from "./email";

const OTP_EXPIRY_MINUTES = 10;

export async function generateAndSendOtp(
  email: string,
  userId: string | null,
  purpose: "REGISTRATION" | "PASSWORD_RESET" | "EMAIL_CHANGE"
) {
  // Generate 6-digit OTP
  const code = randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Invalidate previous OTPs for same email + purpose
  await prisma.otpCode.updateMany({
    where: {
      email: email.toLowerCase(),
      purpose,
      consumedAt: null,
    },
    data: { consumedAt: new Date() },
  });

  await prisma.otpCode.create({
    data: {
      email: email.toLowerCase(),
      code,
      purpose,
      expiresAt,
      userId,
    },
  });

  // Send email
  await sendOtpEmail(email, code, purpose);

  return { success: true, expiresAt };
}

export async function verifyOtp(
  email: string,
  code: string,
  purpose: "REGISTRATION" | "PASSWORD_RESET" | "EMAIL_CHANGE"
): Promise<{ valid: boolean; userId?: string }> {
  const otp = await prisma.otpCode.findFirst({
    where: {
      email: email.toLowerCase(),
      purpose,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) return { valid: false };
  if (otp.code !== code) return { valid: false };

  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { consumedAt: new Date() },
  });

  return { valid: true, userId: otp.userId ?? undefined };
}