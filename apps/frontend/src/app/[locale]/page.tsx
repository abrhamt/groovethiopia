import { setRequestLocale } from "next-intl/server";
import { getPageSections } from "@/lib/pages";
import { api } from "@/lib/api";
import { Hero } from "@/components/home/hero";
import { ManifestoTeaser } from "@/components/home/manifesto-teaser";
import { Ecosystem } from "@/components/home/ecosystem";
import { FeaturedEvent } from "@/components/home/featured-event";
import { CollectionPreview } from "@/components/home/collection-preview";
import { SanctuaryPreview } from "@/components/home/sanctuary-preview";
import { PartnersStrip, InstagramSection } from "@/components/home/partners-strip";
import { InquireCTA } from "@/components/home/inquire-cta";
import { ManifestoTeaserDynamic } from "@/components/home/manifesto-teaser-dynamic";

// Force dynamic - home page fetches from backend at request time
export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Fetch featured data + dynamic page sections in parallel
  const [events, vehicles, projects, partners, sections] = await Promise.all([
    api.getContent({ type: "EVENT", locale, limit: 3 }).catch(() => ({ items: [], total: 0 })),
    api.getContent({ type: "VEHICLE", locale, limit: 3, featured: true }).catch(() => ({ items: [], total: 0 })),
    api.getContent({ type: "REAL_ESTATE_PROJECT", locale, limit: 3, featured: true }).catch(() => ({ items: [], total: 0 })),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/partners`, { next: { revalidate: 300 } })
      .then((r) => r.json())
      .catch(() => ({ partners: [] })),
    getPageSections(["homepage-manifesto"], locale),
  ]);

  // Use dynamic manifesto if available, else fallback to static
  const dynamicManifesto = sections["homepage-manifesto"];

  return (
    <>
      <Hero />
      {dynamicManifesto ? (
        <ManifestoTeaserDynamic section={dynamicManifesto} />
      ) : (
        <ManifestoTeaser />
      )}
      <Ecosystem />
      <FeaturedEvent events={events.items} />
      <CollectionPreview vehicles={vehicles.items} />
      <SanctuaryPreview projects={projects.items} />
      <PartnersStrip partners={partners.partners || []} />
      <InstagramSection username="groovethiopia" />
      <InquireCTA />
    </>
  );
}