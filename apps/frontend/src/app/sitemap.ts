import type { MetadataRoute } from "next";
import { api } from "@/lib/api";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const LOCALES = ["en", "am", "fr", "es"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    "",
    "/about",
    "/divisions",
    "/events",
    "/collection",
    "/sanctuary",
    "/gallery",
    "/partners",
    "/contact",
    "/legal/privacy",
    "/legal/terms",
    "/legal/cookies",
  ];

  const entries: MetadataRoute.Sitemap = [];

  // Static pages × all locales
  for (const page of staticPages) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: page === "" ? 1.0 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((l) => [l, `${BASE_URL}/${l}${page}`])
          ),
        },
      });
    }
  }

  // Dynamic content
  try {
    const [events, vehicles, projects] = await Promise.all([
      api.getContent({ type: "EVENT", locale: "en", limit: 100 }).catch(() => ({ items: [] })),
      api.getContent({ type: "VEHICLE", locale: "en", limit: 100 }).catch(() => ({ items: [] })),
      api.getContent({ type: "REAL_ESTATE_PROJECT", locale: "en", limit: 100 }).catch(() => ({ items: [] })),
    ]);

    const eventEntries = events.items.map((e) => ({
      url: `${BASE_URL}/en/events/${e.slug}`,
      lastModified: e.publishedAt ? new Date(e.publishedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
    const vehicleEntries = vehicles.items.map((v) => ({
      url: `${BASE_URL}/en/collection/${v.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
    const projectEntries = projects.items.map((p) => ({
      url: `${BASE_URL}/en/sanctuary/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    entries.push(...eventEntries, ...vehicleEntries, ...projectEntries);
  } catch {}

  return entries;
}