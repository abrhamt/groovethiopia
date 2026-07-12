import { setRequestLocale } from "next-intl/server";
import { api } from "@/lib/api";
import { GalleryGrid } from "@/components/gallery/grid";
import {
  dummyEvents,
  dummyVehicles,
  dummyProjects,
  withFallback,
} from "@/lib/dummy-data";

// Force dynamic rendering — fetches from backend API
export const dynamic = "force-dynamic";

export default async function GalleryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Get all published content with images. Each list falls back to a
  // curated dummy set so the gallery is always visually populated.
  const [events, vehicles, projects] = await Promise.all([
    api
      .getContent({ type: "EVENT", locale, limit: 30 })
      .then((r) => withFallback(r.items, dummyEvents))
      .catch(() => dummyEvents),
    api
      .getContent({ type: "VEHICLE", locale, limit: 30 })
      .then((r) => withFallback(r.items, dummyVehicles))
      .catch(() => dummyVehicles),
    api
      .getContent({ type: "REAL_ESTATE_PROJECT", locale, limit: 30 })
      .then((r) => withFallback(r.items, dummyProjects))
      .catch(() => dummyProjects),
  ]);

  const allItems = [
    ...events.filter((i) => i.image).map((i) => ({ ...i, division: "events" as const })),
    ...vehicles.filter((i) => i.image).map((i) => ({ ...i, division: "collection" as const })),
    ...projects.filter((i) => i.image).map((i) => ({ ...i, division: "sanctuary" as const })),
  ];

  return (
    <div className="pt-28 md:pt-32">
      <section className="px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <span className="label-mono">Portfolio</span>
          <h1 className="editorial-heading text-4xl sm:text-5xl md:text-7xl lg:text-8xl mt-6 mb-6">
            A <span className="text-gradient-gold italic">visual</span> journey
          </h1>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <GalleryGrid items={allItems} />
        </div>
      </section>
    </div>
  );
}