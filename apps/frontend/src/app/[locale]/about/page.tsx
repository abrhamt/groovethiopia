import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AboutClient />;
}

function AboutClient() {
  const t = useTranslations("about");
  const tValues = useTranslations("about.values");

  const values = [0, 1, 2, 3].map((i) => ({
    title: tValues(`list.${i}.title`),
    body: tValues(`list.${i}.body`),
  }));

  return (
    <div className="pt-32">
      {/* Hero */}
      <section className="px-6 pb-32">
        <div className="max-w-5xl mx-auto">
          <span className="label-mono">About</span>
          <h1 className="editorial-heading text-6xl md:text-8xl mt-6 mb-8">{t("title")}</h1>
          <p className="text-2xl text-ink-200 font-serif font-light leading-relaxed">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* Manifesto */}
      <section className="px-6 py-32 border-y border-ink-800/50 bg-ink-900/30">
        <div className="max-w-4xl mx-auto">
          <span className="label-mono">{t("manifesto.title")}</span>
          <p className="text-2xl md:text-3xl font-serif font-light leading-relaxed mt-8 text-foreground">
            {t("manifesto.body")}
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="px-6 py-32">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <span className="label-mono">{t("mission.title")}</span>
            <p className="text-xl font-serif mt-6 leading-relaxed text-ink-200">{t("mission.body")}</p>
          </div>
          <div>
            <span className="label-mono">{t("vision.title")}</span>
            <p className="text-xl font-serif mt-6 leading-relaxed text-ink-200">{t("vision.body")}</p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="px-6 py-32 border-t border-ink-800/50">
        <div className="max-w-4xl mx-auto">
          <span className="label-mono">{t("story.title")}</span>
          <p className="text-xl font-serif mt-8 leading-relaxed text-ink-200">{t("story.body")}</p>
        </div>
      </section>

      {/* Values */}
      <section className="px-6 py-32 border-t border-ink-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="editorial-heading text-5xl mb-16">{t("values.title")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((v, i) => (
              <div key={i} className="p-8 border border-ink-800 rounded-2xl bg-ink-900/40">
                <span className="label-mono text-gold-400 mb-3 block">0{i + 1}</span>
                <h3 className="font-serif text-2xl mb-3">{v.title}</h3>
                <p className="text-ink-300 leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="px-6 py-32 border-t border-ink-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="editorial-heading text-5xl mb-4">{t("team.title")}</h2>
          <p className="text-ink-400 mb-16">{t("team.subtitle")}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <div className="aspect-square rounded-2xl bg-ink-800 mb-4 flex items-center justify-center text-4xl font-serif text-gold-400">
                  A
                </div>
                <p className="font-medium">Leadership {i}</p>
                <p className="text-xs text-ink-400">Role</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}