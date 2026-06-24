// GET /api/public/live-events — get current or next-up live event
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@groovethiopia/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get("locale") || "en";

    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find event happening now or in next 24h
    const event = await prisma.content.findFirst({
      where: {
        type: { in: ["EVENT", "SHUKSHUTA_EVENT"] },
        status: "PUBLISHED",
        locale,
        startsAt: { lte: in24h, gte: new Date(now.getTime() - 4 * 60 * 60 * 1000) },
      },
      orderBy: { startsAt: "asc" },
    });

    if (!event) {
      return NextResponse.json({ event: null });
    }

    return NextResponse.json({
      event: {
        id: event.id,
        slug: event.slug,
        title: event.title,
        startsAt: event.startsAt,
        venue: event.venue,
      },
    });
  } catch (e) {
    console.error("[public/live-events] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}