import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { dummyVehicles, withFallback } from "@/lib/dummy-data";

// Force dynamic rendering — fetches from backend API
export const dynamic = "force-dynamic";

export default async function CollectionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "trading" });

  const { items: apiVehicles } = await api
    .getContent({ type: "VEHICLE", locale, limit: 100 })
    .catch(() => ({ items: [] }));
  const vehicles = withFallback(apiVehicles, dummyVehicles);

  return (
    <div className="pt-32">
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <span className="label-mono">{t("title")}</span>
          <h1 className="editorial-heading text-6xl md:text-8xl mt-6 mb-8">
            <span className="text-gradient-gold italic">Heritage</span> & Luxury
          </h1>
          <p className="text-2xl font-serif italic text-ink-200 mb-6">{t("tagline")}</p>
          <p className="text-ink-300 max-w-3xl mb-8 leading-relaxed">
            {t("body")}
          </p>
          {t.has("standard") && (
            <p className="text-xs font-mono uppercase tracking-widest text-gold-400">
              {t("standard")}
            </p>
          )}
        </div>
      </section>

      <section className="px-6 py-12 border-t border-ink-800/50">
        <div className="max-w-7xl mx-auto">
          {vehicles.length === 0 ? (
            <p className="text-ink-400 text-center py-20">The collection is currently being curated.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((v) => (
                <Link key={v.id} href={`/${locale}/collection/${v.slug}`} className="group block">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-ink-900 mb-4">
                    {v.image && (
                      <img
                        src={v.image.url}
                        alt={v.image.altText || v.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <p className="label-mono text-ink-400 mb-1">
                    {v.year} · {v.make} · {v.category?.replace("_", " ")}
                  </p>
                  <h3 className="font-serif text-2xl mb-2 group-hover:text-gold-400 transition-colors">{v.title}</h3>
                  {v.price && (
                    <p className="text-lg text-gradient-gold font-semibold">
                      {formatPrice(v.price, v.currency || "USD")}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}