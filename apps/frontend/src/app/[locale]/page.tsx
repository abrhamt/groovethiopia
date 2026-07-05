import { setRequestLocale } from "next-intl/server";
import { api } from "@/lib/api";
import { Hero } from "@/components/home/hero";
import { FeaturedEvent } from "@/components/home/featured-event";
import { PartnersStrip } from "@/components/home/partners-strip";
import {
  dummyEvents,
  dummyPartners,
  withFallback,
} from "@/lib/dummy-data";

// Force dynamic - home page fetches from backend at request time
export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Fetch all events, shukshuta events, and partners in parallel.
  const [eventsRes, shukshutaRes, partnersRes] = await Promise.all([
    api.getContent({ type: "EVENT", locale, limit: 50 }).catch(() => ({ items: [] as any[], total: 0 })),
    api.getContent({ type: "SHUKSHUTA_EVENT", locale, limit: 50 }).catch(() => ({ items: [] as any[], total: 0 })),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/partners`, { next: { revalidate: 300 } })
      .then((r) => r.json())
      .catch(() => ({ partners: [] as any[] })),
  ]);

  // Merge API results with dummy fallbacks.
  const apiEvents = [...eventsRes.items, ...shukshutaRes.items];
  const safeEvents = withFallback(apiEvents, dummyEvents);
  const safePartners = withFallback(partnersRes.partners || [], dummyPartners);

  return (
    <>
      <Hero events={safeEvents} />
      <FeaturedEvent events={safeEvents.slice(0, 3)} />
      <PartnersStrip partners={safePartners} />
    </>
  );
}