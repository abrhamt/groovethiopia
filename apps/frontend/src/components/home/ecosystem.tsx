import Link from "next/link";
import { useTranslations } from "next-intl";

export function Ecosystem() {
  const t = useTranslations("home.ecosystem");

  const divisions = [
    {
      href: "/events",
      title: t("events"),
      desc: t("eventsDesc"),
      image: "https://images.unsplash.com/photo-1571266028243-d220bc56b8f3?w=1200&q=80",
      label: "01",
    },
    {
      href: "/collection",
      title: t("trading"),
      desc: t("tradingDesc"),
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80",
      label: "02",
    },
    {
      href: "/sanctuary",
      title: t("realEstate"),
      desc: t("realEstateDesc"),
      image: "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=1200&q=80",
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