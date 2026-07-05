import Link from "next/link";
import { getLocale } from "next-intl/server";
import { localePath } from "@/lib/locale-path";
import type { ContentItem } from "@/lib/api";

export async function FeaturedEvent({ events }: { events: ContentItem[] }) {
  const locale = await getLocale();
  const lp = (p: string) => localePath(locale, p);

  // Take up to 4 events to showcase sticky stacking
  const displayEvents = events.slice(0, 4);
  if (displayEvents.length === 0) return null;

  return (
    <section className="py-32 px-6 bg-background relative overflow-visible">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 relative overflow-visible">
          {/* Left sticky column */}
          <div className="shrink-0 w-full lg:w-1/3 lg:px-6">
            <div className="lg:sticky lg:top-36 lg:min-h-[75vh] flex flex-col justify-start pt-4">
              <span className="label-mono">THE PULSE</span>
              <h2 className="editorial-heading text-5xl md:text-6xl mt-4 text-white leading-[1.05] tracking-tight">
                One scene,<br />
                <span className="text-gradient-gold font-light italic">four experiences.</span>
              </h2>
              <p className="text-ink-400 text-base font-serif mt-6 max-w-sm">
                Where the contemporary scene gathers. Explore our seasonal flagships, private gatherings, and curated showcases.
              </p>
            </div>
          </div>

          {/* Right sticky card list column */}
          <div className="w-full lg:w-2/3 flex flex-col gap-16 relative pb-32">
            {displayEvents.map((event, index) => (
              <div
                key={event.id}
                className="sticky w-full pointer-events-none"
                style={{
                  top: `calc(140px + ${index} * 32px)`,
                  zIndex: index + 10,
                }}
              >
                <div className="pointer-events-auto flex flex-col overflow-hidden rounded-3xl border border-ink-800 bg-ink-900 text-foreground shadow-2xl transition-all duration-500 hover:border-gold-500/30">
                  {/* Grid Stack Image/Cover */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink-950">
                    {event.image && (
                      <img
                        src={event.image.url}
                        alt={event.image.altText || event.title}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
                    <div className="absolute top-6 left-6">
                      <span className="px-3 py-1 rounded-full bg-gold-500 text-ink-900 text-xs font-mono uppercase tracking-widest">
                        {event.type}
                      </span>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="editorial-heading text-3xl md:text-4xl text-white">
                        {event.title}
                      </h3>
                      {event.subtitle && (
                        <p className="text-gold-400 font-mono text-xs uppercase tracking-wider mt-1">
                          {event.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Grid two columns for date/venue */}
                  <div className="grid grid-cols-2 border-t border-ink-800 bg-ink-950">
                    <div className="flex flex-col items-center justify-center p-6 text-center border-r border-ink-800">
                      <span className="label-mono text-ink-400 mb-1">When</span>
                      <span className="font-serif text-base text-ink-100 leading-tight">
                        {new Date(event.startsAt || "").toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <span className="label-mono text-ink-400 mb-1">Where</span>
                      <span className="font-serif text-base text-ink-100 leading-tight">
                        {event.venue || "Addis Ababa"}
                      </span>
                    </div>
                  </div>

                  {/* Buy / Book Ticket Button — goes directly to the multi-gateway checkout */}
                  <Link
                    href={lp(`/tickets/checkout?event=${event.slug || event.id}`)}
                    className="group relative block w-full py-4 text-center text-xs font-mono font-semibold uppercase tracking-widest border-t border-ink-800 bg-ink-900 hover:bg-gold-500 hover:text-ink-900 text-gold-400 transition-colors duration-300"
                  >
                    {event.ticketPrice && Number(event.ticketPrice) > 0 ? "Buy Ticket" : "Book Tickets"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}