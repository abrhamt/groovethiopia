import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { api } from "@/lib/api";
import { dummyProjects, withFallback } from "@/lib/dummy-data";

// Force dynamic rendering — fetches from backend API
export const dynamic = "force-dynamic";

export default async function SanctuaryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "realEstate" });

  const { items: apiProjects } = await api
    .getContent({ type: "REAL_ESTATE_PROJECT", locale, limit: 50 })
    .catch(() => ({ items: [] }));
  const projects = withFallback(apiProjects, dummyProjects);

  return (
    <div className="pt-28 md:pt-32">
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <span className="label-mono">{t("title")}</span>
          <h1 className="editorial-heading text-4xl sm:text-5xl md:text-7xl lg:text-8xl mt-6 mb-8">
            Designing the <span className="text-gradient-gold italic">future</span> of hospitality
          </h1>
          <p className="text-xl font-serif text-ink-200 max-w-3xl leading-relaxed mb-6">
            {t("vision")}
          </p>
          {t.has("future") && (
            <p className="text-xs font-mono uppercase tracking-widest text-gold-400">
              {t("future")}
            </p>
          )}
        </div>
      </section>

      {/* Project pipeline */}
      <section className="px-6 py-24 border-t border-ink-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="editorial-heading text-4xl mb-12">{t("pipeline")}</h2>
          {projects.length === 0 ? (
            <p className="text-ink-400 text-center py-12">Projects in development will appear here.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((p) => (
                <Link key={p.id} href={`/${locale}/sanctuary/${p.slug}`} className="group block">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-ink-900 mb-4 relative">
                    {p.image && (
                      <img src={p.image.url} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    )}
                    {p.projectStage && (
                      <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gold-500 text-ink-900 text-xs font-mono uppercase tracking-widest">
                        {p.projectStage.toLowerCase()}
                      </span>
                    )}
                  </div>
                  <p className="label-mono text-ink-400 mb-1">{p.location}</p>
                  <h3 className="font-serif text-2xl group-hover:text-gold-400 transition-colors">{p.title}</h3>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Design philosophy */}
      <section className="px-6 py-16 md:py-32 border-t border-ink-800/50 bg-ink-900/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <span className="label-mono">{t("philosophy.title")}</span>
            <h2 className="editorial-heading text-4xl mt-4 mb-6">Sustainable luxury</h2>
            <p className="text-lg text-ink-200 leading-relaxed">
              {t("philosophy.body")}
            </p>
          </div>
          <div>
            <span className="label-mono">{t("investment.title")}</span>
            <h2 className="editorial-heading text-4xl mt-4 mb-6">Once-in-a-generation</h2>
            <p className="text-lg text-ink-200 leading-relaxed">
              {t("investment.body")}
            </p>
          </div>
        </div>
      </section>

      {/* On-demand */}
      <section className="px-6 py-16 md:py-32 border-t border-ink-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <span className="label-mono">{t("onDemand.title")}</span>
          <h2 className="editorial-heading text-3xl sm:text-4xl md:text-5xl mt-4 mb-6">
            Have land? Have a vision?
          </h2>
          <p className="text-xl text-ink-200 font-serif mb-8">
            {t("onDemand.body")}
          </p>
          <Link href={`/${locale}/contact`} className="btn-primary text-lg">Start a Conversation</Link>
        </div>
      </section>
    </div>
  );
}