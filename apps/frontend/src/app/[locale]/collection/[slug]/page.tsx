import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { dummyVehicles, findDummyBySlug } from "@/lib/dummy-data";
import type { ContentItem } from "@/lib/api";

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  // Try backend first; fall back to a curated dummy vehicle so deep
  // links like /collection/2024-bentley-continental-gt always resolve.
  let item: ContentItem | null = null;
  try {
    const res = await api.getContentBySlug(slug, locale);
    item = res.item;
    if (item.type !== "VEHICLE") notFound();
  } catch {
    const dummy = findDummyBySlug(dummyVehicles, slug);
    if (!dummy) notFound();
    item = dummy;
  }

  if (!item) notFound();

  return (
    <div className="pt-28 md:pt-32 pb-16 md:pb-24">
      <article className="max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <Link href={`/${locale}/collection`} className="text-xs font-mono uppercase tracking-widest text-gold-400 hover:text-gold-300">
            ← The Collection
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-3">
            {item.media && item.media.length > 0 ? (
              item.media.map((m, i) => (
                <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden bg-ink-900">
                  <img src={m.url} alt={m.altText || item.title} className="w-full h-full object-cover" />
                </div>
              ))
            ) : item.image && (
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-ink-900">
                <img src={item.image.url} alt={item.title} className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div>
            <span className="label-mono">{item.category?.replace("_", " ")}</span>
            <h1 className="editorial-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-4 mb-4">{item.title}</h1>
            <p className="text-xl text-ink-300 font-serif mb-2">
              {item.year} · {item.make} {item.model}
            </p>
            {item.price && (
              <p className="text-3xl text-gradient-gold font-semibold mb-8">
                {formatPrice(item.price, item.currency || "USD")}
              </p>
            )}

            {item.excerpt && (
              <p className="text-lg text-ink-200 mb-8 font-serif">{item.excerpt}</p>
            )}

            {item.body && (
              <div className="text-ink-300 leading-relaxed mb-12 whitespace-pre-wrap">
                {item.body}
              </div>
            )}

            <Link href={`/${locale}/contact`} className="btn-primary">Request Consultation</Link>
          </div>
        </div>
      </article>
    </div>
  );
}
