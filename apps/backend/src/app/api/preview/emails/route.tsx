// GET /api/preview/emails — render all email templates to HTML for preview
import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";
import { OtpEmail } from "@/emails/otp";
import { InquiryNotification } from "@/emails/inquiry";
import { ContentSubmittedEmail, ContentApprovedEmail, ContentRejectedEmail } from "@/emails/approval";
import { BookingConfirmation } from "@/emails/booking";
import { NewUserRegistrationEmail, UserApprovedEmail } from "@/emails/user";
import { WeeklyDigestEmail } from "@/emails/weekly-digest";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const template = searchParams.get("template") || "all";

  const templates: Record<string, { subject: string; element: React.ReactElement }> = {
    otp: {
      subject: "Verify your Groovethiopia account",
      element: <OtpEmail code="847291" purpose="REGISTRATION" />,
    },
    "inquiry-notification": {
      subject: "New EVENTS inquiry from Maria Santos",
      element: <InquiryNotification
        inquiry={{
          id: "demo-1",
          division: "EVENTS",
          name: "Maria Santos",
          organization: "Tbilisi Music Collective",
          email: "maria@tbilisicollective.ge",
          phone: "+995 555 12 34 56",
          message: "Hello! We're a collective of electronic music promoters based in Tbilisi and we'd love to discuss a collaboration for the next Shukshuta edition. We've been following your scene closely and think there's a great cultural exchange opportunity. Looking forward to hearing from you.",
        }}
      />,
    },
    "content-submitted": {
      subject: "Abel Tadesse submitted VEHICLE for review",
      element: <ContentSubmittedEmail type="VEHICLE" title="1962 Jaguar E-Type Series 1" authorName="Abel Tadesse" />,
    },
    "content-approved": {
      subject: 'Your VEHICLE "1962 Jaguar E-Type" is live',
      element: <ContentApprovedEmail type="VEHICLE" title="1962 Jaguar E-Type" authorName="Abel Tadesse" isLive={true} />,
    },
    "content-rejected": {
      subject: 'Changes requested on "1962 Jaguar E-Type"',
      element: <ContentRejectedEmail
        type="VEHICLE"
        title="1962 Jaguar E-Type"
        authorName="Abel Tadesse"
        reason="Please update the price field to a non-zero value and add at least 3 high-quality photos before resubmitting. The description is great — keep that voice."
      />,
    },
    "booking-confirmation": {
      subject: "You're confirmed for Shukshuta Vol. III",
      element: <BookingConfirmation
        booking={{
          name: "Dawit Mekonnen",
          eventTitle: "Shukshuta Vol. III",
          eventDate: "Saturday, July 18, 2026 · 9:00 PM",
          venue: "Addis Ababa · Skyline Rooftop",
          partySize: 2,
          ticketPrice: 4500,
          bookingId: "cmqsgu7590001cu9i2q5wt1y6",
        }}
      />,
    },
    "new-user": {
      subject: "New admin request: Hana Bekele",
      element: <NewUserRegistrationEmail name="Hana Bekele" email="hana@groovethiopia.com" />,
    },
    "user-approved": {
      subject: "Your Groovethiopia admin access is active",
      element: <UserApprovedEmail name="Hana Bekele" />,
    },
    "weekly-digest": {
      subject: "Weekly digest · Jun 17 – Jun 24",
      element: <WeeklyDigestEmail
        adminName="Abel Tadesse"
        stats={{
          newInquiries: 12,
          newBookings: 8,
          newTickets: 24,
          newUsers: 45,
          newContent: 6,
          publishedContent: 4,
          newMessages: 3,
          revenue: 184500,
          pendingReviews: 2,
          topEvents: [
            { title: "Horizon Festival 2026", slug: "horizon-festival-2026", revenue: 102000, tickets: 12 },
            { title: "Shukshuta Vol. III", slug: "shukshuta-vol-iii", revenue: 58500, tickets: 13 },
            { title: "Open Air: After Hours", slug: "open-air-after-hours", revenue: 24000, tickets: 4 },
          ],
          periodStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          periodEnd: new Date().toISOString(),
        }}
      />,
    },
  };

  if (template === "all") {
    // Render all templates and return an index page
    const rendered = await Promise.all(
      Object.entries(templates).map(async ([key, t]) => ({
        key,
        subject: t.subject,
        html: await render(t.element),
      }))
    );

    const html = `<!DOCTYPE html>
<html>
<head>
<title>Groovethiopia Email Templates</title>
<style>
body { background: #0a0a0a; color: #f5f5f5; font-family: system-ui; padding: 40px; margin: 0; }
h1 { color: #d49520; font-family: Georgia, serif; margin-bottom: 8px; }
.subtitle { color: #a3a3a3; margin-bottom: 40px; }
.template { margin-bottom: 60px; border-bottom: 1px solid #2d2d2d; padding-bottom: 40px; }
.template h2 { color: #d49520; font-family: Georgia, serif; margin-bottom: 4px; }
.template .subject { color: #a3a3a3; font-size: 13px; font-family: monospace; margin-bottom: 16px; }
iframe { width: 100%; height: 800px; border: 1px solid #2d2d2d; border-radius: 8px; background: white; }
.actions { margin-bottom: 12px; }
.actions a { color: #d49520; text-decoration: none; font-size: 12px; font-family: monospace; padding: 6px 12px; border: 1px solid #d49520; border-radius: 4px; margin-right: 8px; }
</style>
</head>
<body>
<h1>Groovethiopia Email Templates</h1>
<p class="subtitle">${rendered.length} templates — designed with React Email, rendered server-side</p>
${rendered.map(r => `
<div class="template">
  <h2>${r.key}</h2>
  <div class="subject">Subject: ${r.subject}</div>
  <div class="actions">
    <a href="/api/preview/emails/${r.key}" target="_blank">Open in new tab</a>
    <a href="/api/preview/emails/raw/${r.key}" target="_blank">View HTML source</a>
  </div>
  <iframe srcdoc='${r.html.replace(/'/g, "&#39;")}'></iframe>
</div>
`).join("")}
</body>
</html>`;

    return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  // Single template
  const t = templates[template];
  if (!t) {
    return NextResponse.json({ error: "Template not found", available: Object.keys(templates) }, { status: 404 });
  }
  const html = await render(t.element);

  if (searchParams.get("format") === "raw") {
    return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}