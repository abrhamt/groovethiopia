import Link from "next/link";
import { getLocale } from "next-intl/server";
import { localePath } from "@/lib/locale-path";
import type { ContentItem } from "@/lib/api";
import { MobileCarouselDots } from "./featured-event-dots";

export async function FeaturedEvent({ events }: { events: ContentItem[] }) {
  const locale = await getLocale();
  const lp = (p: string) => localePath(locale, p);

  // Take up to 4 events to showcase
  const displayEvents = events.slice(0, 4);
  if (displayEvents.length === 0) return null;

  return (
    <section className="py-16 md:py-32 bg-background relative">
      <div className="max-w-7xl mx-auto">
        {/* Header - always visible */}
        <div className="px-4 sm:px-6 mb-8 lg:mb-0">
          <div className="lg:hidden">
            <span className="label-mono">THE PULSE</span>
            <h2 className="editorial-heading text-3xl sm:text-4xl mt-4 text-white leading-[1.05] tracking-tight">
              One scene,{" "}
              <span className="text-gradient-gold font-light italic">four experiences.</span>
            </h2>
            <p className="text-ink-400 text-sm font-serif mt-4 max-w-sm">
              Where the contemporary scene gathers. Explore our seasonal flagships, private gatherings, and curated showcases.
            </p>
          </div>
        </div>

        {/* Desktop layout: side-by-side with sticky stacking */}
        <div className="hidden lg:flex flex-row gap-16 relative px-6">
          {/* Left sticky column */}
          <div className="shrink-0 w-1/3 px-6">
            <div className="sticky top-36 min-h-[75vh] flex flex-col justify-start pt-4">
              <span className="label-mono">THE PULSE</span>
              <h2 className="editorial-heading text-5xl lg:text-6xl mt-4 text-white leading-[1.05] tracking-tight">
                One scene,
                <br />
                <span className="text-gradient-gold font-light italic">four experiences.</span>
              </h2>
              <p className="text-ink-400 text-base font-serif mt-6 max-w-sm">
                Where the contemporary scene gathers. Explore our seasonal flagships, private gatherings, and curated showcases.
              </p>
            </div>
          </div>

          {/* Right card list - sticky stacking */}
          <div className="w-2/3 flex flex-col gap-10 relative pb-[50vh]">
            {displayEvents.map((event, index) => (
              <div
                key={event.id}
                className={`event-card-stack-${index} w-full`}
              >
                <EventCard event={event} lp={lp} />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile layout: horizontal snap carousel */}
        <div className="lg:hidden">
          <div
            className="featured-carousel flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-6 px-4 sm:px-6 -mx-0"
            id="featured-carousel"
          >
            {displayEvents.map((event) => (
              <div
                key={event.id}
                className="snap-center shrink-0 w-[85vw] sm:w-[75vw] md:w-[60vw]"
              >
                <EventCard event={event} lp={lp} />
              </div>
            ))}
            {/* Right edge spacer so last card can center */}
            <div className="shrink-0 w-4 sm:w-6" aria-hidden="true" />
          </div>

          {/* Scroll indicator dots */}
          <MobileCarouselDots count={displayEvents.length} />
        </div>
      </div>

      <style>{`
        /* Hide scrollbar on the carousel */
        .featured-carousel {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .featured-carousel::-webkit-scrollbar {
          display: none;
        }

        /* Desktop sticky stacking */
        .event-card-stack-0,
        .event-card-stack-1,
        .event-card-stack-2,
        .event-card-stack-3 {
          position: relative;
        }
        @media (min-width: 1024px) {
          .event-card-stack-0 { position: sticky; top: 120px; z-index: 10; }
          .event-card-stack-1 { position: sticky; top: 160px; z-index: 11; }
          .event-card-stack-2 { position: sticky; top: 200px; z-index: 12; }
          .event-card-stack-3 { position: sticky; top: 240px; z-index: 13; }
        }
      `}</style>
    </section>
  );
}

/** Shared event card used in both mobile carousel and desktop sticky layout */
function EventCard({
  event,
  lp,
}: {
  event: ContentItem;
  lp: (p: string) => string;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-ink-800 bg-ink-900 text-foreground shadow-2xl transition-all duration-500 hover:border-gold-500/30 h-full">
      {/* Image */}
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
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
          <span className="px-3 py-1 rounded-full bg-gold-500 text-ink-900 text-xs font-mono uppercase tracking-widest">
            {event.type}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
          <h3 className="editorial-heading text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white leading-tight">
            {event.title}
          </h3>
          {event.subtitle && (
            <p className="text-gold-400 font-mono text-xs uppercase tracking-wider mt-1">
              {event.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Date / Venue */}
      <div className="grid grid-cols-2 border-t border-ink-800 bg-ink-950">
        <div className="flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 text-center border-r border-ink-800">
          <span className="label-mono text-ink-400 mb-1">When</span>
          <span className="font-serif text-xs sm:text-sm md:text-base text-ink-100 leading-tight">
            {new Date(event.startsAt || "").toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 text-center">
          <span className="label-mono text-ink-400 mb-1">Where</span>
          <span className="font-serif text-xs sm:text-sm md:text-base text-ink-100 leading-tight">
            {event.venue || "Addis Ababa"}
          </span>
        </div>
      </div>

      {/* CTA */}
      <Link
        href={lp(`/tickets/checkout?event=${event.slug || event.id}`)}
        className="group relative block w-full py-3 sm:py-4 text-center text-xs font-mono font-semibold uppercase tracking-widest border-t border-ink-800 bg-ink-900 hover:bg-gold-500 hover:text-ink-900 text-gold-400 transition-colors duration-300 mt-auto"
      >
        {event.ticketPrice && Number(event.ticketPrice) > 0 ? "Buy Ticket" : "Book Tickets"}
      </Link>
    </div>
  );
}