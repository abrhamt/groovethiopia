// GET /api/admin/analytics — aggregated metrics for admin dashboard
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@groovethiopia/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "30d";

  const now = new Date();
  let start = new Date();
  let days = 30;

  if (range === "7d") { start = new Date(now.getTime() - 7 * 86400000); days = 7; }
  else if (range === "30d") { start = new Date(now.getTime() - 30 * 86400000); days = 30; }
  else if (range === "90d") { start = new Date(now.getTime() - 90 * 86400000); days = 90; }
  else if (range === "all") { start = new Date(0); days = 365; }

  try {
    // Total revenue
    const revenueAgg = await prisma.ticketPurchase.aggregate({
      where: { status: "CONFIRMED", createdAt: { gte: start } },
      _sum: { totalPrice: true },
    });
    const totalRevenue = Number(revenueAgg._sum.totalPrice || 0);

    // Totals for headline numbers
    const [
      totalInquiries,
      totalBookings,
      totalTickets,
      totalUsers,
      totalContent,
      totalPublished,
      totalOpenEvents,
    ] = await Promise.all([
      prisma.inquiry.count({ where: { createdAt: { gte: start } } }),
      prisma.eventBooking.count({ where: { createdAt: { gte: start } } }),
      prisma.ticketPurchase.count({ where: { createdAt: { gte: start } } }),
      prisma.publicUser.count({ where: { createdAt: { gte: start } } }),
      prisma.content.count({ where: { createdAt: { gte: start } } }),
      prisma.content.count({ where: { publishedAt: { gte: start } } }),
      prisma.content.count({ where: { type: { in: ["EVENT", "SHUKSHUTA_EVENT"] }, status: "PUBLISHED", startsAt: { gte: now } } }),
    ]);

    // Time-series: build day buckets
    const buckets: { date: string; inquiries: number; bookings: number; tickets: number; revenue: number; users: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const day = d.toISOString().split("T")[0];
      buckets.push({ date: day, inquiries: 0, bookings: 0, tickets: 0, revenue: 0, users: 0 });
    }

    // Pull raw data and bucket it
    const [inquiries, bookings, tickets, users] = await Promise.all([
      prisma.inquiry.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true } }),
      prisma.eventBooking.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true } }),
      prisma.ticketPurchase.findMany({ where: { createdAt: { gte: start }, status: "CONFIRMED" }, select: { createdAt: true, totalPrice: true, quantity: true } }),
      prisma.publicUser.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true } }),
    ]);

    const dateIndex = new Map(buckets.map((b, i) => [b.date, i]));

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

    // Top content by ticket revenue
    const topContentRaw = await prisma.ticketPurchase.groupBy({
      by: ["eventId"],
      where: { status: "CONFIRMED", createdAt: { gte: start } },
      _sum: { totalPrice: true, quantity: true },
    });

    const topContent = await Promise.all(
      topContentRaw
        .sort((a, b) => Number(b._sum.totalPrice || 0) - Number(a._sum.totalPrice || 0))
        .slice(0, 5)
        .map(async (t) => {
          const c = await prisma.content.findUnique({
            where: { id: t.eventId },
            select: { id: true, title: true, slug: true, type: true, ticketPrice: true },
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

    // Funnel: views vs inquiries vs bookings vs tickets
    // (Views are not tracked in schema; estimate by counting published content viewed-through-inquiries)
    const funnel = {
      publishedItems: totalPublished,
      inquiries: totalInquiries,
      bookings: totalBookings,
      tickets: totalTickets,
    };

    // Recent activity
    const recentActivity = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { name: true, email: true } } },
    }).catch(() => []); // audit log might not exist in this build

    return NextResponse.json({
      range: { label: range, days, start: start.toISOString(), end: now.toISOString() },
      headline: {
        revenue: totalRevenue,
        inquiries: totalInquiries,
        bookings: totalBookings,
        tickets: totalTickets,
        users: totalUsers,
        content: totalContent,
        openEvents: totalOpenEvents,
      },
      timeseries: buckets,
      topContent,
      funnel,
      recentActivity: recentActivity.map((a: any) => ({
        id: a.id,
        action: a.action,
        entity: a.entity,
        entityId: a.entityId,
        user: a.user?.name || a.user?.email || "System",
        createdAt: a.createdAt,
      })),
    });
  } catch (e) {
    console.error("[admin/analytics] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
