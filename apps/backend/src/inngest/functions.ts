// Inngest functions — scheduled jobs + event-driven
import { inngest } from "@/lib/inngest";
import { prisma } from "@groovethiopia/db";

// Auto-publish scheduled content
export const autoPublishScheduled = inngest.createFunction(
  { id: "auto-publish-scheduled" },
  { cron: "*/1 * * * *" }, // every minute
  async ({ step }) => {
    const now = new Date();
    const due = await prisma.content.findMany({
      where: {
        status: "APPROVED",
        scheduledFor: { lte: now, not: null },
        publishedAt: null,
      },
    });

    for (const item of due) {
      await prisma.content.update({
        where: { id: item.id },
        data: { status: "PUBLISHED", publishedAt: now },
      });
    }
    return { published: due.length };
  }
);

// Auto-unpublish expired content
export const autoUnpublishExpired = inngest.createFunction(
  { id: "auto-unpublish-expired" },
  { cron: "*/5 * * * *" }, // every 5 minutes
  async ({ step }) => {
    const now = new Date();
    const expired = await prisma.content.findMany({
      where: {
        status: "PUBLISHED",
        unpublishAt: { lte: now, not: null },
      },
    });

    for (const item of expired) {
      // For vehicles: mark as SOLD, otherwise ARCHIVED
      const newStatus = item.type === "VEHICLE" ? "SOLD" : "ARCHIVED";
      await prisma.content.update({
        where: { id: item.id },
        data: { status: newStatus },
      });
    }
    return { unpublished: expired.length };
  }
);

// Auto-end past events
export const autoEndEvents = inngest.createFunction(
  { id: "auto-end-events" },
  { cron: "*/15 * * * *" }, // every 15 minutes
  async ({ step }) => {
    const now = new Date();
    const past = await prisma.content.findMany({
      where: {
        type: { in: ["EVENT", "SHUKSHUTA_EVENT"] },
        status: "PUBLISHED",
        endsAt: { lte: now, not: null },
      },
    });

    for (const item of past) {
      await prisma.content.update({
        where: { id: item.id },
        data: { status: "ENDED" },
      });
    }
    return { ended: past.length };
  }
);

// Event handlers
export const onSubmission = inngest.createFunction(
  { id: "on-submission" },
  { event: "content/submitted" },
  async ({ event, step }) => {
    const admins = await step.run("get-admins", async () => {
      return prisma.user.findMany({
        where: { role: "ADMIN", status: "ACTIVE" },
        select: { email: true },
      });
    });

    await step.run("send-notification", async () => {
      const { sendSubmissionNotification } = await import("@/lib/email");
      await sendSubmissionNotification(
        admins.map((a) => a.email),
        {
          type: event.data.type,
          title: event.data.title,
          authorName: event.data.authorName,
        }
      );
    });
  }
);

export const onUserRegistered = inngest.createFunction(
  { id: "on-user-registered" },
  { event: "user/registered" },
  async ({ event, step }) => {
    const admins = await step.run("get-admins", async () => {
      return prisma.user.findMany({
        where: { role: "ADMIN", status: "ACTIVE" },
        select: { email: true },
      });
    });

    await step.run("notify-admins", async () => {
      const { sendNewUserRegistrationNotification } = await import("@/lib/email");
      await sendNewUserRegistrationNotification(
        admins.map((a) => a.email),
        event.data
      );
    });
  }
);

export const onInquiry = inngest.createFunction(
  { id: "on-inquiry" },
  { event: "inquiry/created" },
  async ({ event, step }) => {
    const inquiry = await step.run("get-inquiry", async () => {
      return prisma.inquiry.findUnique({ where: { id: event.data.inquiryId } });
    });

    if (!inquiry) return;

    await step.run("notify-admins", async () => {
      const { sendNewInquiryNotification } = await import("@/lib/email");
      await sendNewInquiryNotification({
        id: inquiry.id,
        division: inquiry.division,
        name: inquiry.name,
        email: inquiry.email,
      });
    });
  }
);

export const functions = [
  autoPublishScheduled,
  autoUnpublishExpired,
  autoEndEvents,
  onSubmission,
  onUserRegistered,
  onInquiry,
];