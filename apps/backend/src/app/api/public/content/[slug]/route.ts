// GET /api/public/content/[slug] — single content item by slug
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@groovethiopia/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get("locale") || "en";

    // Try exact locale first, fall back to English
    let item = await prisma.content.findFirst({
      where: {
        slug,
        locale,
        status: { in: ["PUBLISHED", "APPROVED"] },
      },
      include: {
        media: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!item && locale !== "en") {
      item = await prisma.content.findFirst({
        where: {
          slug,
          locale: "en",
          status: { in: ["PUBLISHED", "APPROVED"] },
        },
        include: {
          media: { orderBy: { createdAt: "asc" } },
        },
      });
    }

    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ item: serializeContent(item) });
  } catch (e) {
    console.error("[public/content/slug] error", e);
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
    body: c.body,
    locale: c.locale,
    publishedAt: c.publishedAt,
    startsAt: c.startsAt,
    endsAt: c.endsAt,
    venue: c.venue,
    venueAddress: c.venueAddress,
    price: c.price?.toString(),
    currency: c.currency,
    year: c.year,
    make: c.make,
    model: c.model,
    category: c.category,
    location: c.location,
    projectStage: c.projectStage,
    metadata: c.metadata,
    media: c.media?.map((m: any) => ({
      url: m.publicUrl,
      thumbnailUrl: m.thumbnailUrl,
      blurhash: m.blurhash,
      altText: m.altText,
      width: m.width,
      height: m.height,
    })),
  };
}