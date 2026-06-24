// GET /api/public/pages/[slug] — fetch page section content
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

    let page = await prisma.content.findFirst({
      where: { slug, type: "PAGE", locale, status: "PUBLISHED" },
    });

    if (!page && locale !== "en") {
      page = await prisma.content.findFirst({
        where: { slug, type: "PAGE", locale: "en", status: "PUBLISHED" },
      });
    }

    if (!page) {
      return NextResponse.json({ page: null });
    }

    return NextResponse.json({
      page: {
        slug: page.slug,
        title: page.title,
        subtitle: page.subtitle,
        excerpt: page.excerpt,
        body: page.body,
        locale: page.locale,
      },
    });
  } catch (e) {
    console.error("[public/pages] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}