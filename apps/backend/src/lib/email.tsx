// Email service via Resend
import { Resend } from "resend";
import { prisma } from "@groovethiopia/db";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM || "Groovethiopia <hello@groovethiopia.com>";

const layout = (content: string) => `
  <div style="background:#0a0a0a;color:#f5f5f5;font-family:system-ui;padding:40px 20px;">
    <div style="max-width:480px;margin:0 auto;background:#1a1a1a;border:1px solid #2d2d2d;border-radius:12px;padding:40px;">
      <h1 style="color:#d49520;font-size:24px;margin:0 0 24px;font-weight:600;font-family:Georgia,serif;">Groovethiopia</h1>
      ${content}
    </div>
  </div>
`;

export async function sendOtpEmail(
  to: string,
  code: string,
  purpose: "REGISTRATION" | "PASSWORD_RESET" | "EMAIL_CHANGE"
) {
  if (!resend) {
    console.warn("[email] Resend not configured — would send OTP", { to, purpose });
    return { success: true, mocked: true };
  }

  const subjects = {
    REGISTRATION: "Verify your Groovethiopia account",
    PASSWORD_RESET: "Reset your Groovethiopia password",
    EMAIL_CHANGE: "Verify your new email",
  };

  await resend.emails.send({
    from: FROM,
    to,
    subject: subjects[purpose],
    html: layout(`
      <p style="color:#a3a3a3;font-size:14px;margin:0 0 24px;">${subjects[purpose]}</p>
      <div style="background:#0a0a0a;border:1px solid #404040;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px;">
        <p style="color:#737373;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;">Your code</p>
        <p style="color:#d49520;font-size:32px;font-weight:700;letter-spacing:8px;margin:0;font-family:monospace;">${code}</p>
      </div>
      <p style="color:#737373;font-size:12px;margin:0;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
    `),
  });
}

export async function sendEmail(args: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  if (!resend) {
    console.warn("[email] Resend not configured — would send", args.subject);
    return { success: true, mocked: true };
  }
  return resend.emails.send({
    from: FROM,
    to: args.to,
    subject: args.subject,
    html: layout(args.html),
  });
}

export async function sendNewInquiryNotification(inquiry: {
  id: string;
  division: string;
  name: string;
  email: string;
}) {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", status: "ACTIVE" },
    select: { email: true },
  });

  if (admins.length === 0) return;

  await sendEmail({
    to: admins.map((a) => a.email),
    subject: `New ${inquiry.division} inquiry from ${inquiry.name}`,
    html: `
      <h2 style="color:#f5f5f5;font-size:18px;margin:0 0 16px;">New Inquiry</h2>
      <p style="margin:8px 0;color:#a3a3a3;"><strong style="color:#f5f5f5;">Division:</strong> ${inquiry.division}</p>
      <p style="margin:8px 0;color:#a3a3a3;"><strong style="color:#f5f5f5;">From:</strong> ${inquiry.name} (${inquiry.email})</p>
      <a href="${process.env.NEXT_PUBLIC_ADMIN_URL}/inquiries/${inquiry.id}" style="display:inline-block;margin-top:24px;background:#d49520;color:#0a0a0a;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">View Inquiry</a>
    `,
  });
}

export async function sendSubmissionNotification(
  adminEmails: string[],
  content: { type: string; title: string; authorName: string }
) {
  if (adminEmails.length === 0) return;
  await sendEmail({
    to: adminEmails,
    subject: `New ${content.type} submission: ${content.title}`,
    html: `
      <h2 style="color:#f5f5f5;font-size:18px;margin:0 0 16px;">Content Awaiting Approval</h2>
      <p style="margin:8px 0;color:#a3a3a3;"><strong style="color:#f5f5f5;">Type:</strong> ${content.type}</p>
      <p style="margin:8px 0;color:#a3a3a3;"><strong style="color:#f5f5f5;">Title:</strong> ${content.title}</p>
      <p style="margin:8px 0;color:#a3a3a3;"><strong style="color:#f5f5f5;">Author:</strong> ${content.authorName}</p>
      <a href="${process.env.NEXT_PUBLIC_ADMIN_URL}/review" style="display:inline-block;margin-top:24px;background:#d49520;color:#0a0a0a;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Review Now</a>
    `,
  });
}