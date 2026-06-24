// POST /api/admin/digest/send — trigger weekly digest immediately (admin only)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@groovethiopia/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

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
      ? await prisma.content.findMany({ where: { id: { in: eventIds } }, select: { id: true, title: true, slug: true } })
      : [];
    const eventMap = new Map(events.map((e) => [e.id, e]));

    const topEvents = topEventsRaw
      .map((t) => {
        const e = eventMap.get(t.eventId);
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

    const stats = {
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

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN", status: "ACTIVE" },
      select: { email: true, name: true },
    });

    let sent = 0;
    for (const admin of admins) {
      try {
        const { sendWeeklyDigest } = await import("@/lib/email");
        await sendWeeklyDigest({
          to: admin.email,
          adminName: admin.name || undefined,
          stats,
        });
        sent++;
      } catch (e) {
        console.error(`[digest:manual] failed to send to ${admin.email}`, e);
      }
    }

    return NextResponse.json({ success: true, sent, stats });
  } catch (e) {
    console.error("[digest:manual] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
