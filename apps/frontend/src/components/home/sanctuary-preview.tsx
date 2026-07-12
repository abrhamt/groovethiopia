import Link from "next/link";
import { getLocale } from "next-intl/server";
import type { ContentItem } from "@/lib/api";
import { localePath } from "@/lib/locale-path";

export async function SanctuaryPreview({ projects }: { projects: ContentItem[] }) {
  if (projects.length === 0) return null;
  const featured = projects[0];
  const locale = await getLocale();
  const lp = (p: string) => localePath(locale, p);

  return (
    <section className="py-16 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <span className="label-mono">The Sanctuary</span>
            <h2 className="editorial-heading text-3xl sm:text-4xl md:text-6xl lg:text-7xl mt-4 mb-6">
              Designing the future of hospitality
            </h2>
            <p className="text-ink-300 text-lg mb-8 font-serif leading-relaxed">
              {featured.excerpt || "Sustainable-luxury retreats nestled in forests, mountains, and along Ethiopia's iconic rivers and lakes."}
            </p>
            {featured.location && (
              <p className="text-sm text-ink-400 mb-8">
                <span className="label-mono text-ink-500 mr-3">Featured</span> {featured.title} · {featured.location}
              </p>
            )}
            <Link href={lp("/sanctuary")} className="btn-primary">
              Explore Investment
            </Link>
          </div>
          <div className="order-1 lg:order-2 aspect-[4/5] rounded-2xl overflow-hidden bg-ink-900">
            {featured.image && (
              <img
                src={featured.image.url}
                alt={featured.image.altText || featured.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}