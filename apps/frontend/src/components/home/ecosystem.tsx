import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { dummyImages } from "@/lib/dummy-data";
import { localePath } from "@/lib/locale-path";

export async function Ecosystem() {
  const t = await getTranslations("home.ecosystem");
  const locale = await getLocale();
  const lp = (p: string) => localePath(locale, p);

  const divisions = [
    {
      href: lp("/events"),
      title: t("events"),
      desc: t("eventsDesc"),
      image: dummyImages.ecosystemEvents,
      label: "01",
    },
    {
      href: lp("/collection"),
      title: t("trading"),
      desc: t("tradingDesc"),
      image: dummyImages.ecosystemCollection,
      label: "02",
    },
    {
      href: lp("/sanctuary"),
      title: t("realEstate"),
      desc: t("realEstateDesc"),
      image: dummyImages.ecosystemSanctuary,
      label: "03",
    },
  ];

  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
          <span className="label-mono">The Ecosystem</span>
          <h2 className="editorial-heading text-5xl md:text-7xl mt-4 mb-6">{t("title")}</h2>
          <p className="text-ink-300 max-w-xl text-lg">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {divisions.map((d) => (
            <Link
              key={d.href}
              href={d.href}
              className="group relative overflow-hidden rounded-2xl aspect-[3/4] block"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                role="img"
                aria-label={d.title}
                style={{ backgroundImage: `url(${d.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <span className="label-mono text-gold-400">{d.label}</span>
                <h3 className="font-serif text-3xl mt-2 mb-2 text-foreground group-hover:text-gold-400 transition-colors">
                  {d.title}
                </h3>
                <p className="text-sm text-ink-200">{d.desc}</p>
                <div className="mt-4 text-xs font-mono uppercase tracking-widest text-ink-300 group-hover:text-gold-400 transition-colors">
                  Explore →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}