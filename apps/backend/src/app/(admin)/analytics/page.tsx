import { prisma } from "@groovethiopia/db";
import { auth } from "@/lib/auth";
import { AnalyticsClient } from "@/components/admin/analytics-client";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return <div className="p-8 text-ink-400">Access denied — admin only.</div>;
  }

  const now = new Date();
  const start = new Date(now.getTime() - 30 * 86400000);
  const days = 30;

  // Build time-series buckets
  const buckets: { date: string; inquiries: number; bookings: number; tickets: number; revenue: number; users: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const day = d.toISOString().split("T")[0];
    buckets.push({ date: day, inquiries: 0, bookings: 0, tickets: 0, revenue: 0, users: 0 });
  }
  const dateIndex = new Map(buckets.map((b, i) => [b.date, i]));

  const [revenueAgg, totalInquiries, totalBookings, totalTickets, totalUsers, totalContent, totalPublished, totalOpenEvents, topContentRaw, inquiries, bookings, tickets, users] = await Promise.all([
    prisma.ticketPurchase.aggregate({
      where: { status: "CONFIRMED", createdAt: { gte: start } },
      _sum: { totalPrice: true },
    }),
    prisma.inquiry.count({ where: { createdAt: { gte: start } } }),
    prisma.eventBooking.count({ where: { createdAt: { gte: start } } }),
    prisma.ticketPurchase.count({ where: { createdAt: { gte: start } } }),
    prisma.publicUser.count({ where: { createdAt: { gte: start } } }),
    prisma.content.count({ where: { createdAt: { gte: start } } }),
    prisma.content.count({ where: { publishedAt: { gte: start } } }),
    prisma.content.count({ where: { type: { in: ["EVENT", "SHUKSHUTA_EVENT"] }, status: "PUBLISHED", startsAt: { gte: now } } }),
    prisma.ticketPurchase.groupBy({
      by: ["eventId"],
      where: { status: "CONFIRMED", createdAt: { gte: start } },
      _sum: { totalPrice: true, quantity: true },
    }),
    prisma.inquiry.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true } }),
    prisma.eventBooking.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true } }),
    prisma.ticketPurchase.findMany({ where: { createdAt: { gte: start }, status: "CONFIRMED" }, select: { createdAt: true, totalPrice: true, quantity: true } }),
    prisma.publicUser.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true } }),
  ]);

  for (const x of inquiries) {
    const day = x.createdAt.toISOString().split("T")[0];
    const i = dateIndex.get(day);
    if (i !== undefined) buckets[i].inquiries++;
  }
  for (const x of bookings) {
    const day = x.createdAt.toISOString().split("T")[0];
    const i = dateIndex.get(day);
    if (i !== undefined) buckets[i].bookings++;
  }
  for (const x of tickets) {
    const day = x.createdAt.toISOString().split("T")[0];
    const i = dateIndex.get(day);
    if (i !== undefined) {
      buckets[i].tickets += x.quantity;
      buckets[i].revenue += Number(x.totalPrice);
    }
  }
  for (const x of users) {
    const day = x.createdAt.toISOString().split("T")[0];
    const i = dateIndex.get(day);
    if (i !== undefined) buckets[i].users++;
  }

  const topContent = await Promise.all(
    topContentRaw
      .sort((a, b) => Number(b._sum.totalPrice || 0) - Number(a._sum.totalPrice || 0))
      .slice(0, 5)
      .map(async (t) => {
        const c = await prisma.content.findUnique({
          where: { id: t.eventId },
          select: { id: true, title: true, slug: true, type: true },
        });
        return c ? {
          id: c.id,
          title: c.title,
          slug: c.slug,
          type: c.type,
          revenue: Number(t._sum.totalPrice || 0),
          tickets: t._sum.quantity || 0,
        } : null;
      })
  ).then((arr) => arr.filter((x): x is NonNullable<typeof x> => x !== null));

  const initial = {
    range: { label: "30d", days: 30, start: start.toISOString(), end: now.toISOString() },
    headline: {
      revenue: Number(revenueAgg._sum.totalPrice || 0),
      inquiries: totalInquiries,
      bookings: totalBookings,
      tickets: totalTickets,
      users: totalUsers,
      content: totalContent,
      openEvents: totalOpenEvents,
    },
    timeseries: buckets,
    topContent,
    funnel: {
      publishedItems: totalPublished,
      inquiries: totalInquiries,
      bookings: totalBookings,
      tickets: totalTickets,
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-semibold mb-2">Analytics</h1>
        <p className="text-ink-400 text-sm">Platform metrics, top performers, conversion funnel.</p>
      </div>
      <AnalyticsClient initial={initial as any} />
    </div>
  );
}
