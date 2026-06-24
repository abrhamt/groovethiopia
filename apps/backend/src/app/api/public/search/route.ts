// GET /api/public/search — site-wide search
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@groovethiopia/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const locale = searchParams.get("locale") || "en";
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!q || q.length < 2) {
      return NextResponse.json({ items: [], total: 0 });
    }

    const where: any = {
      status: "PUBLISHED",
      locale,
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { subtitle: { contains: q, mode: "insensitive" } },
        { excerpt: { contains: q, mode: "insensitive" } },
        { body: { contains: q, mode: "insensitive" } },
        { venue: { contains: q, mode: "insensitive" } },
        { make: { contains: q, mode: "insensitive" } },
        { model: { contains: q, mode: "insensitive" } },
        { location: { contains: q, mode: "insensitive" } },
      ],
    };

    if (type) where.type = type;

    const [items, total] = await Promise.all([
      prisma.content.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        take: limit,
        include: { media: { take: 1, orderBy: { createdAt: "asc" } } },
      }),
      prisma.content.count({ where }),
    ]);

    return NextResponse.json({
      items: items.map((c) => ({
        id: c.id,
        type: c.type,
        slug: c.slug,
        title: c.title,
        subtitle: c.subtitle,
        excerpt: c.excerpt,
        venue: c.venue,
        year: c.year,
        make: c.make,
        model: c.model,
        price: c.price?.toString(),
        location: c.location,
        startsAt: c.startsAt,
        image: c.media[0] ? {
          url: c.media[0].publicUrl,
          thumbnailUrl: c.media[0].thumbnailUrl,
        } : null,
      })),
      total,
    });
  } catch (e) {
    console.error("[public/search] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}