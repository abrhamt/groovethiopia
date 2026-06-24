// Email service via Resend — uses React Email templates
import { Resend } from "resend";
import { render } from "@react-email/render";
import { prisma } from "@groovethiopia/db";
import { OtpEmail } from "@/emails/otp";
import { InquiryNotification } from "@/emails/inquiry";
import {
  ContentSubmittedEmail,
  ContentApprovedEmail,
  ContentRejectedEmail,
} from "@/emails/approval";
import { BookingConfirmation } from "@/emails/booking";
import { NewUserRegistrationEmail, UserApprovedEmail } from "@/emails/user";
import { WeeklyDigestEmail } from "@/emails/weekly-digest";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM || "Groovethiopia <hello@groovethiopia.com>";

async function send(to: string | string[], subject: string, reactElement: React.ReactElement) {
  const html = await render(reactElement);
  if (!resend) {
    console.warn(`[email] Resend not configured — would send "${subject}" to`, to);
    return { success: true, mocked: true };
  }
  return resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
  });
}

// ============================================================
// OTP — Registration + Password Reset
// ============================================================

export async function sendOtpEmail(
  to: string,
  code: string,
  purpose: "REGISTRATION" | "PASSWORD_RESET" | "EMAIL_CHANGE"
) {
  const subject = purpose === "REGISTRATION"
    ? "Verify your Groovethiopia account"
    : purpose === "PASSWORD_RESET"
    ? "Reset your Groovethiopia password"
    : "Verify your new email";

  await send(to, subject, <OtpEmail code={code} purpose={purpose as any} />);
}

// ============================================================
// Contact Inquiries
// ============================================================

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

  const full = await prisma.inquiry.findUnique({ where: { id: inquiry.id } });
  if (!full) return;

  await send(
    admins.map((a) => a.email),
    `New ${inquiry.division.toLowerCase()} inquiry from ${inquiry.name}`,
    <InquiryNotification
      inquiry={{
        id: full.id,
        division: full.division,
        name: full.name,
        organization: full.organization,
        email: full.email,
        phone: full.phone,
        message: full.message,
      }}
    />
  );
}

// ============================================================
// Content Workflow
// ============================================================

export async function sendSubmissionNotification(
  adminEmails: string[],
  content: { type: string; title: string; authorName: string }
) {
  if (adminEmails.length === 0) return;
  await send(
    adminEmails,
    `New ${content.type} submission: ${content.title}`,
    <ContentSubmittedEmail {...content} />
  );
}

export async function sendContentApprovedEmail(
  editorEmail: string,
  content: { type: string; title: string; isLive: boolean }
) {
  await send(
    editorEmail,
    `Your ${content.type} "${content.title}" is ${content.isLive ? "live" : "approved"}`,
    <ContentApprovedEmail
      type={content.type}
      title={content.title}
      authorName=""
      isLive={content.isLive}
    />
  );
}

export async function sendContentRejectedEmail(
  editorEmail: string,
  content: { type: string; title: string; reason: string; authorName?: string }
) {
  await send(
    editorEmail,
    `Changes requested on "${content.title}"`,
    <ContentRejectedEmail
      type={content.type}
      title={content.title}
      reason={content.reason}
      authorName={content.authorName || ""}
    />
  );
}

// ============================================================
// Booking Confirmations
// ============================================================

export async function sendBookingConfirmation(
  to: string,
  booking: {
    name: string;
    eventTitle: string;
    eventDate: string;
    venue: string;
    partySize: number;
    ticketPrice?: number;
    bookingId: string;
  }
) {
  await send(
    to,
    `You're confirmed for ${booking.eventTitle}`,
    <BookingConfirmation booking={booking} />
  );
}

// ============================================================
// User Management
// ============================================================

export async function sendNewUserRegistrationNotification(
  adminEmails: string[],
  user: { name: string; email: string }
) {
  if (adminEmails.length === 0) return;
  await send(
    adminEmails,
    `New admin request: ${user.name}`,
    <NewUserRegistrationEmail {...user} />
  );
}

export async function sendUserApprovedEmail(
  to: string,
  name: string
) {
  await send(to, "Your Groovethiopia admin access is active", <UserApprovedEmail name={name} />);
}
// ============================================================
// Weekly Digest
// ============================================================

export async function sendWeeklyDigest({
  to,
  adminName,
  stats,
}: {
  to: string;
  adminName?: string;
  stats: {
    newInquiries: number;
    newBookings: number;
    newTickets: number;
    newUsers: number;
    newContent: number;
    publishedContent: number;
    newMessages: number;
    revenue: number;
    pendingReviews: number;
    topEvents: { title: string; slug: string; revenue: number; tickets: number }[];
    periodStart: string;
    periodEnd: string;
  };
}) {
  const period = `${new Date(stats.periodStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date(stats.periodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  await send(
    to,
    `Weekly digest · ${period}`,
    <WeeklyDigestEmail adminName={adminName || "Admin"} stats={stats as any} />
  );
}
