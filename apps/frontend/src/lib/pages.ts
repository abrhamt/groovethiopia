// Helper to fetch dynamic page content from backend
import { api } from "./api";

export type PageSection = {
  slug: string;
  title: string;
  subtitle?: string | null;
  excerpt?: string | null;
  body?: string | null;
  locale: string;
};

export async function getPageSection(slug: string, locale = "en"): Promise<PageSection | null> {
  try {
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const res = await fetch(`${API}/api/public/pages/${slug}?locale=${locale}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.page;
  } catch {
    return null;
  }
}

// Fetch multiple sections at once
export async function getPageSections(slugs: string[], locale = "en"): Promise<Record<string, PageSection | null>> {
  const results = await Promise.all(slugs.map((s) => getPageSection(s, locale)));
  const map: Record<string, PageSection | null> = {};
  slugs.forEach((s, i) => (map[s] = results[i]));
  return map;
}