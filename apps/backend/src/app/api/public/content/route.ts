// GET /api/public/content — list published content (used by frontend)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@groovethiopia/db";
import { verifyRecaptcha } from "@/lib/recaptcha";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const locale = searchParams.get("locale") || "en";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const featured = searchParams.get("featured") === "true";

    const where: any = {
      status: { in: ["PUBLISHED", "APPROVED"] },
      locale,
      ...(type && { type }),
      ...(featured && { metadata: { path: ["featured"], equals: true } }),
    };

    const [items, total] = await Promise.all([
      prisma.content.findMany({
        where,
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: limit,
        skip: offset,
        include: {
          media: { take: 1, orderBy: { createdAt: "asc" } },
        },
      }),
      prisma.content.count({ where }),
    ]);

    return NextResponse.json({
      items: items.map(serializeContent),
      total,
      limit,
      offset,
    });
  } catch (e) {
    console.error("[public/content] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function serializeContent(c: any) {
  return {
    id: c.id,
    type: c.type,
    slug: c.slug,
    title: c.title,
    subtitle: c.subtitle,
    excerpt: c.excerpt,
    locale: c.locale,
    publishedAt: c.publishedAt,
    startsAt: c.startsAt,
    endsAt: c.endsAt,
    venue: c.venue,
    price: c.price?.toString(),
    year: c.year,
    make: c.make,
    model: c.model,
    category: c.category,
    location: c.location,
    metadata: c.metadata,
    image: c.media?.[0] ? {
      url: c.media[0].publicUrl,
      thumbnailUrl: c.media[0].thumbnailUrl,
      blurhash: c.media[0].blurhash,
      altText: c.media[0].altText,
      width: c.media[0].width,
      height: c.media[0].height,
    } : null,
  };
}