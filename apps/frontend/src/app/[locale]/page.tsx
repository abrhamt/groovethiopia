import { useTranslations } from "next-intl";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { api, type ContentItem } from "@/lib/api";
import { Hero } from "@/components/home/hero";

// Force dynamic - home page fetches from backend at request time
export const dynamic = "force-dynamic";
import { ManifestoTeaser } from "@/components/home/manifesto-teaser";
import { Ecosystem } from "@/components/home/ecosystem";
import { FeaturedEvent } from "@/components/home/featured-event";
import { CollectionPreview } from "@/components/home/collection-preview";
import { SanctuaryPreview } from "@/components/home/sanctuary-preview";
import { PartnersStrip } from "@/components/home/partners-strip";
import { InquireCTA } from "@/components/home/inquire-cta";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Fetch featured data in parallel
  const [events, vehicles, projects, partners] = await Promise.all([
    api.getContent({ type: "EVENT", locale, limit: 3 }).catch(() => ({ items: [], total: 0 })),
    api.getContent({ type: "VEHICLE", locale, limit: 3, featured: true }).catch(() => ({ items: [], total: 0 })),
    api.getContent({ type: "REAL_ESTATE_PROJECT", locale, limit: 3, featured: true }).catch(() => ({ items: [], total: 0 })),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/partners`, { next: { revalidate: 300 } })
      .then((r) => r.json())
      .catch(() => ({ partners: [] })),
  ]);

  return (
    <>
      <Hero />
      <ManifestoTeaser />
      <Ecosystem />
      <FeaturedEvent events={events.items} />
      <CollectionPreview vehicles={vehicles.items} />
      <SanctuaryPreview projects={projects.items} />
      <PartnersStrip partners={partners.partners || []} />
      <InquireCTA />
    </>
  );
}