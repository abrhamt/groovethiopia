import Link from "next/link";
import { useTranslations } from "next-intl";
import { formatDate } from "@/lib/utils";
import type { ContentItem } from "@/lib/api";

export function FeaturedEvent({ events }: { events: ContentItem[] }) {
  const t = useTranslations("home.featured");
  const tCommon = useTranslations("common");

  const featured = events[0];
  if (!featured) return null;

  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {featured.image && (
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-ink-900 relative">
              <img
                src={featured.image.url}
                alt={featured.image.altText || featured.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-6 left-6">
                <span className="px-3 py-1 rounded-full bg-gold-500 text-ink-900 text-xs font-mono uppercase tracking-widest">
                  Live
                </span>
              </div>
            </div>
          )}

          <div>
            <span className="label-mono">{t("events")}</span>
            <h2 className="editorial-heading text-5xl md:text-6xl mt-4 mb-6">{featured.title}</h2>
            {featured.excerpt && (
              <p className="text-ink-300 text-lg mb-8 font-serif">{featured.excerpt}</p>
            )}
            <div className="space-y-2 mb-8 text-sm">
              {featured.startsAt && (
                <p className="text-ink-300"><span className="label-mono text-ink-400 mr-3">When</span> {formatDate(featured.startsAt)}</p>
              )}
              {featured.venue && (
                <p className="text-ink-300"><span className="label-mono text-ink-400 mr-3">Where</span> {featured.venue}</p>
              )}
            </div>
            <Link href={`/events/${featured.slug}`} className="btn-primary">
              Request Invitation
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}