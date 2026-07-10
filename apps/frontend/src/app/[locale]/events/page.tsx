import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { dummyEvents, dummyFeaturedEvent, dummyImages, withFallback } from "@/lib/dummy-data";
import { EventCalendar } from "@/components/events/event-calendar";

// Force dynamic rendering — fetches from backend API
export const dynamic = "force-dynamic";

export default async function EventsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "events" });

  const { items: apiEvents } = await api
    .getContent({ type: "EVENT", locale, limit: 50 })
    .catch(() => ({ items: [] }));
  const events = withFallback(apiEvents, dummyEvents);

  return (
    <div className="pt-32">
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <span className="label-mono">{t("title")}</span>
          <h1 className="editorial-heading text-6xl md:text-8xl mt-6 mb-8">
            <span className="text-gradient-gold italic">Events</span> & Production
          </h1>
          <p className="text-2xl font-serif italic text-ink-200 mb-6">
            {t("tagline")}
          </p>
          <p className="text-base leading-relaxed text-ink-400 max-w-3xl mb-8">
            {t("description")}
          </p>
          <p className="text-xs font-mono uppercase tracking-widest text-gold-400">
            {t("experience")}
          </p>
        </div>
      </section>

      {/* Shukshuta */}
      <section className="px-6 py-24 border-y border-ink-800/50 bg-ink-900/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="aspect-[4/5] rounded-2xl overflow-hidden">
            <img src={dummyImages.heroAlt} alt="Shukshuta Speakeasy" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="label-mono">{t("shukshuta.title")}</span>
            <h2 className="editorial-heading text-5xl md:text-6xl mt-4 mb-6">Shukshuta</h2>
            <p className="text-xl text-ink-200 font-serif leading-relaxed mb-8">
              {t("shukshuta.body")}
            </p>
            <Link href={`/${locale}/events/${dummyFeaturedEvent.slug}`} className="btn-primary">Book Tickets</Link>
          </div>
        </div>
      </section>

      {/* Upcoming */}
      <section className="px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <h2 className="editorial-heading text-4xl mb-12">{t("upcoming")}</h2>
          {events.length === 0 ? (
            <p className="text-ink-400">No upcoming events at the moment.</p>
          ) : (
            <div className="space-y-4">
              {events.map((e) => (
                <Link key={e.id} href={`/${locale}/events/${e.slug}`} className="group block p-6 border border-ink-800 rounded-2xl hover:border-gold-500/30 transition-all bg-ink-900/40">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-2">
                      <p className="label-mono text-gold-400">{e.startsAt && formatDate(e.startsAt, locale)}</p>
                    </div>
                    <div className="md:col-span-7">
                      <h3 className="font-serif text-2xl group-hover:text-gold-400 transition-colors">{e.title}</h3>
                      {e.venue && <p className="text-sm text-ink-400 mt-1">{e.venue}</p>}
                    </div>
                    <div className="md:col-span-3 text-right">
                      <span className="text-xs font-mono uppercase tracking-widest text-ink-400 group-hover:text-gold-400 transition-colors">
                        Details →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Calendar Section */}
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <EventCalendar events={events} locale={locale} />
        </div>
      </section>

      {/* Services */}
      <section className="px-6 py-24 border-t border-ink-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="editorial-heading text-4xl mb-12">{t("services.title")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="p-6 border border-ink-800 rounded-2xl bg-ink-900/40">
                <span className="label-mono text-gold-400">0{i + 1}</span>
                <p className="font-serif text-xl mt-3">{t(`services.items.${i}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}