import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { BookingButton } from "@/components/booking/booking-modal";
import { dummyEvents, findDummyBySlug } from "@/lib/dummy-data";
import type { ContentItem } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  // Try backend first; if the API is unreachable or returns no item,
  // fall back to a curated dummy event so deep links remain useful.
  let item: ContentItem | null = null;
  try {
    const res = await api.getContentBySlug(slug, locale);
    item = res.item;
    if (item.type !== "EVENT" && item.type !== "SHUKSHUTA_EVENT") notFound();
  } catch {
    const dummy = findDummyBySlug(dummyEvents, slug);
    if (!dummy) notFound();
    item = dummy;
  }

  if (!item) notFound();

  const eventEnd = item.endsAt ? new Date(item.endsAt) : null;
  const isUpcoming = !item.endsAt || eventEnd! > new Date();

  return (
    <div className="pt-32 pb-24">
      <article className="max-w-5xl mx-auto px-6">
        <div className="mb-8">
          <Link
            href={`/${locale}/events`}
            className="text-xs font-mono uppercase tracking-widest text-gold-400 hover:text-gold-300"
          >
            ← The Pulse
          </Link>
        </div>

        {item.image && (
          <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-12">
            <img
              src={item.image.url}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <span className="label-mono">
          {item.type === "SHUKSHUTA_EVENT" ? "Shukshuta" : "Event"}
        </span>
        <h1 className="editorial-heading text-5xl md:text-7xl mt-4 mb-6">
          {item.title}
        </h1>

        {item.subtitle && (
          <p className="text-xl text-ink-200 font-serif italic mb-6">
            {item.subtitle}
          </p>
        )}

        {item.startsAt && (
          <p className="text-lg text-ink-200 font-serif mb-2">
            {formatDate(item.startsAt, locale)}
          </p>
        )}
        {item.venue && (
          <p className="text-ink-400 mb-12">
            {item.venue}
            {item.venueAddress && ` · ${item.venueAddress}`}
          </p>
        )}

        {item.excerpt && (
          <p className="text-2xl text-ink-200 font-serif leading-relaxed mb-8 italic">
            {item.excerpt}
          </p>
        )}

        {item.body && (
          <div className="prose prose-invert max-w-none text-lg text-ink-200 font-serif leading-relaxed mb-12 whitespace-pre-wrap">
            {item.body}
          </div>
        )}

        <div className="border-t border-ink-800 pt-8 flex flex-col sm:flex-row gap-4">
          {isUpcoming ? (
            <BookingButton
              eventId={item.id}
              eventTitle={item.title}
              startsAt={item.startsAt || new Date().toISOString()}
              venue={item.venue}
              capacity={item.metadata?.capacity}
              ticketPrice={item.ticketPrice ? Number(item.ticketPrice) : undefined}
              eventSlug={item.slug}
            />
          ) : (
            <div className="px-5 py-3 rounded-full border border-ink-700 text-ink-400 text-sm">
              This event has ended
            </div>
          )}
          <Link href={`/${locale}/contact`} className="btn-ghost">
            More inquiries
          </Link>
        </div>
      </article>
    </div>
  );
}
