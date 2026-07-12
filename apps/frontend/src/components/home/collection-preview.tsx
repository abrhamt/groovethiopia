import Link from "next/link";
import { getLocale } from "next-intl/server";
import { formatPrice } from "@/lib/utils";
import { localePath } from "@/lib/locale-path";
import type { ContentItem } from "@/lib/api";

export async function CollectionPreview({ vehicles }: { vehicles: ContentItem[] }) {
  if (vehicles.length === 0) return null;
  const locale = await getLocale();
  const lp = (p: string) => localePath(locale, p);

  return (
    <section className="py-16 md:py-32 px-6 border-t border-ink-800/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-16">
          <div>
            <span className="label-mono">The Collection</span>
            <h2 className="editorial-heading text-3xl sm:text-4xl md:text-6xl lg:text-7xl mt-4">Heritage & Modernity</h2>
          </div>
          <Link href={lp("/collection")} className="hidden md:inline-flex btn-ghost">
            View all
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {vehicles.slice(0, 3).map((v) => (
            <Link key={v.id} href={lp(`/collection/${v.slug}`)} className="group block">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-ink-900 mb-4">
                {v.image && (
                  <img
                    src={v.image.url}
                    alt={v.image.altText || v.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="label-mono text-ink-400 mb-1">
                    {v.year} · {v.make}
                  </p>
                  <h3 className="font-serif text-2xl group-hover:text-gold-400 transition-colors">{v.title}</h3>
                </div>
                {v.price && (
                  <p className="text-gold-400 font-semibold whitespace-nowrap">
                    {formatPrice(v.price, v.currency || "USD")}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

        <div className="md:hidden mt-8 text-center">
          <Link href={lp("/collection")} className="btn-ghost">View all</Link>
        </div>
      </div>
    </section>
  );
}