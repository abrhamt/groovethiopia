// POST /api/admin/content — create new content
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@groovethiopia/db";
import { auth } from "@/lib/auth";
import { autoTranslate } from "@/lib/translate";

const baseSchema = z.object({
  type: z.enum(["EVENT", "SHUKSHUTA_EVENT", "VEHICLE", "REAL_ESTATE_PROJECT", "PAGE"]),
  slug: z.string().min(2).max(200).optional(),
  title: z.string().min(2).max(200),
  subtitle: z.string().max(300).optional(),
  excerpt: z.string().max(1000).optional(),
  body: z.string().max(50000).optional(),
  locale: z.string().default("en"),
  parentId: z.string().optional(),

  // Event
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  venue: z.string().max(300).optional(),
  venueAddress: z.string().max(500).optional(),
  capacity: z.number().int().positive().optional(),
  ticketPrice: z.number().positive().optional(),

  // Vehicle
  price: z.number().positive().optional(),
  currency: z.string().max(10).optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  make: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  category: z.enum(["MODERN_LUXURY", "VINTAGE_CLASSIC"]).optional(),

  // Real estate
  location: z.string().max(300).optional(),
  projectStage: z.enum(["PLANNING", "DESIGN", "CONSTRUCTION", "OPERATIONAL"]).optional(),

  // Scheduling
  scheduledFor: z.string().datetime().optional(),
  unpublishAt: z.string().datetime().optional(),

  // Auto-translate on create?
  autoTranslate: z.boolean().default(true),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = baseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    const slug = data.slug || slugify(data.title);

    // Check slug uniqueness
    const existing = await prisma.content.findFirst({
      where: { slug, locale: data.locale },
    });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists for this locale" }, { status: 409 });
    }

    // Editors create drafts only
    const isAdmin = session.user.role === "ADMIN";
    const status = isAdmin && data.scheduledFor ? "APPROVED" : "DRAFT";

    const content = await prisma.content.create({
      data: {
        type: data.type,
        slug,
        title: data.title,
        subtitle: data.subtitle,
        excerpt: data.excerpt,
        body: data.body,
        locale: data.locale,
        parentId: data.parentId,
        status,
        authorId: session.user.id,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        venue: data.venue,
        venueAddress: data.venueAddress,
        capacity: data.capacity,
        ticketPrice: data.ticketPrice,
        price: data.price,
        currency: data.currency || "USD",
        year: data.year,
        make: data.make,
        model: data.model,
        category: data.category,
        location: data.location,
        projectStage: data.projectStage,
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
        unpublishAt: data.unpublishAt ? new Date(data.unpublishAt) : null,
        publishedAt: isAdmin && !data.scheduledFor ? new Date() : null,
      },
    });

    // Auto-translate to other locales if requested
    if (data.autoTranslate && data.locale === "en") {
      const targets = ["am", "fr", "es"];
      const translatableFields = ["title", "subtitle", "excerpt", "body"] as const;

      for (const target of targets) {
        const translations: Record<string, string> = {};
        for (const field of translatableFields) {
          const value = data[field];
          if (value && value.trim()) {
            translations[field] = await autoTranslate(value, "en", target);
          }
        }

        const translatedSlug = slugify(translations.title || data.title);

        await prisma.content.create({
          data: {
            type: data.type,
            slug: translatedSlug,
            title: translations.title || data.title,
            subtitle: translations.subtitle || data.subtitle,
            excerpt: translations.excerpt || data.excerpt,
            body: translations.body || data.body,
            locale: target,
            parentId: content.id,
            status: "DRAFT", // Translations always start as drafts for review
            authorId: session.user.id,
            startsAt: data.startsAt ? new Date(data.startsAt) : null,
            endsAt: data.endsAt ? new Date(data.endsAt) : null,
            venue: data.venue,
            venueAddress: data.venueAddress,
            capacity: data.capacity,
            ticketPrice: data.ticketPrice,
            price: data.price,
            currency: data.currency || "USD",
            year: data.year,
            make: data.make,
            model: data.model,
            category: data.category,
            location: data.location,
            projectStage: data.projectStage,
            scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
            unpublishAt: data.unpublishAt ? new Date(data.unpublishAt) : null,
          },
        });
      }
    }

    return NextResponse.json({ success: true, content });
  } catch (e) {
    console.error("[admin/content POST] error", e);
    return NextResponse.json({ error: "Failed to create content" }, { status: 500 });
  }
}