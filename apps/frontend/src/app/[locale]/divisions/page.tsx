import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { dummyImages } from "@/lib/dummy-data";

// Force dynamic rendering — fetches from backend API
export const dynamic = "force-dynamic";

export default function DivisionsPage({ params }: { params: Promise<{ locale: string }> }) {
  return <DivisionsContent params={params} />;
}

async function DivisionsContent({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const divisions = [
    {
      href: `/${locale}/events`,
      label: "01",
      title: "The Pulse",
      tagline: "We engineer cultural milestones",
      desc: "Large-scale festivals, intimate speakeasies, bespoke social experiences.",
      image: dummyImages.ecosystemEvents,
    },
    {
      href: `/${locale}/collection`,
      label: "02",
      title: "The Collection",
      tagline: "True luxury is timeless",
      desc: "Elite modern vehicles and meticulously refurbished vintage classics.",
      image: dummyImages.ecosystemCollection,
    },
    {
      href: `/${locale}/sanctuary`,
      label: "03",
      title: "The Sanctuary",
      tagline: "Designing the future of hospitality",
      desc: "Boutique escapes nestled in forests, mountains, and along iconic rivers.",
      image: dummyImages.ecosystemSanctuary,
    },
  ];

  return (
    <div className="pt-28 md:pt-32">
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <span className="label-mono">Divisions</span>
          <h1 className="editorial-heading text-4xl sm:text-5xl md:text-7xl lg:text-8xl mt-6 mb-8">
            Three worlds. <span className="text-gradient-gold italic">One vision.</span>
          </h1>
        </div>
      </section>

      {divisions.map((d, i) => (
        <section key={d.href} className={`px-6 py-24 ${i % 2 === 1 ? "bg-ink-900/30" : ""}`}>
          <div className="max-w-7xl mx-auto">
            <Link href={d.href} className="group block">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className={`aspect-[4/3] rounded-2xl overflow-hidden ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                  <img src={d.image} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                  <span className="label-mono text-gold-400">{d.label}</span>
                  <h2 className="editorial-heading text-3xl sm:text-4xl md:text-5xl lg:text-7xl mt-4 mb-6 group-hover:text-gold-400 transition-colors">
                    {d.title}
                  </h2>
                  <p className="text-xl text-ink-200 font-serif italic mb-4">{d.tagline}</p>
                  <p className="text-ink-300 mb-8">{d.desc}</p>
                  <div className="text-sm font-mono uppercase tracking-widest text-gold-400">
                    Enter →
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      ))}

      <section className="px-6 py-16 md:py-32 border-t border-ink-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-base sm:text-xl md:text-2xl font-serif font-light leading-relaxed text-ink-200">
            Each division reinforces the others. Events fund the cultural capital.
            Trading builds commercial velocity. Real estate creates destinations that anchor it all.
          </p>
        </div>
      </section>
    </div>
  );
}