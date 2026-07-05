// Inngest functions — scheduled jobs + event-driven
import { inngest } from "@/lib/inngest";
import { prisma } from "@groovethiopia/db";
import { expireStaleSessions } from "@/lib/payments/state-machine";

// Auto-publish scheduled content
export const autoPublishScheduled = inngest.createFunction(
  { id: "auto-publish-scheduled" },
  { cron: "*/1 * * * *" },
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
  { cron: "*/5 * * * *" },
  async ({ step }) => {
    const now = new Date();
    const expired = await prisma.content.findMany({
      where: {
        status: "PUBLISHED",
        unpublishAt: { lte: now, not: null },
      },
    });

    for (const item of expired) {
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
  { cron: "*/15 * * * *" },
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

// Expire stale checkout sessions — every minute
export const expireCheckoutSessions = inngest.createFunction(
  { id: "expire-checkout-sessions" },
  { cron: "*/1 * * * *" },
  async () => {
    const count = await expireStaleSessions();
    return { expired: count };
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
        select: { email: true, name: true },
      });
    });

    await step.run("notify-admins", async () => {
      const { sendNewUserRegistrationNotification } = await import("@/lib/email");
      await sendNewUserRegistrationNotification(admins.map((a) => a.email), event.data);
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

// Weekly digest — every Monday at 9 AM UTC
export const weeklyDigest = inngest.createFunction(
  { id: "weekly-digest" },
  { cron: "0 9 * * 1" },
  async ({ step }) => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats = await step.run("aggregate-stats", async () => {
      const [newInquiries, newBookings, newTickets, newUsers, newContent, publishedContent] = await Promise.all([
        prisma.inquiry.count({ where: { createdAt: { gte: weekAgo } } }),
        prisma.eventBooking.count({ where: { createdAt: { gte: weekAgo } } }),
        prisma.ticketPurchase.count({ where: { createdAt: { gte: weekAgo } } }),
        prisma.publicUser.count({ where: { createdAt: { gte: weekAgo } } }),
        prisma.content.count({ where: { createdAt: { gte: weekAgo } } }),
        prisma.content.count({ where: { publishedAt: { gte: weekAgo } } }),
      ]);

      const revenueAgg = await prisma.ticketPurchase.aggregate({
        where: { status: "CONFIRMED", createdAt: { gte: weekAgo } },
        _sum: { totalPrice: true },
      });

      const pendingReviews = await prisma.content.count({ where: { status: "PENDING_REVIEW" } });

      const topEventsRaw = await prisma.ticketPurchase.groupBy({
        by: ["eventId"],
        where: { status: "CONFIRMED", createdAt: { gte: weekAgo } },
        _sum: { totalPrice: true, quantity: true },
      });

      const eventIds = topEventsRaw.map((t) => t.eventId);
      const events = eventIds.length > 0
        ? await prisma.content.findMany({
          where: { id: { in: eventIds } },
          select: { id: true, title: true, slug: true },
        })
        : [];
      const eventMap = new Map(events.map((e: any) => [e.id, e]));

      const topEvents = topEventsRaw
        .map((t) => {
          const e: any = eventMap.get(t.eventId);
          if (!e) return null;
          return {
            title: e.title,
            slug: e.slug,
            revenue: Number(t._sum.totalPrice || 0),
            tickets: t._sum.quantity || 0,
          };
        })
        .filter((x): x is { title: string; slug: string; revenue: number; tickets: number } => x !== null)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 3);

      return {
        newInquiries,
        newBookings,
        newTickets,
        newUsers,
        newContent,
        publishedContent,
        newMessages: 0,
        revenue: Number(revenueAgg._sum.totalPrice || 0),
        pendingReviews,
        topEvents,
        periodStart: weekAgo.toISOString(),
        periodEnd: now.toISOString(),
      };
    });

    const admins = await step.run("get-admins", async () => {
      return prisma.user.findMany({
        where: { role: "ADMIN", status: "ACTIVE" },
        select: { email: true, name: true },
      });
    });

    if (admins.length === 0) {
      return { sent: 0, reason: "no admins" };
    }

    await step.run("send-digests", async () => {
      const { sendWeeklyDigest } = await import("@/lib/email");
      for (const admin of admins) {
        try {
          await sendWeeklyDigest({
            to: admin.email,
            adminName: admin.name || undefined,
            stats,
          });
        } catch (e) {
          console.error("[digest] failed to send to " + admin.email, e);
        }
      }
    });

    return { sent: admins.length, stats };
  }
);

export const functions = [
  autoPublishScheduled,
  autoUnpublishExpired,
  autoEndEvents,
  expireCheckoutSessions,
  onSubmission,
  onUserRegistered,
  onInquiry,
  weeklyDigest,
];