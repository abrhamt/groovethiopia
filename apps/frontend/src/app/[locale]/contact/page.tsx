import { setRequestLocale } from "next-intl/server";
import { ContactClient } from "@/components/contact/contact-client";

// Contact has interactive forms — render dynamically
export const dynamic = "force-dynamic";

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="pt-32 pb-24">
      <section className="px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          <span className="label-mono">Contact</span>
          <h1 className="editorial-heading text-6xl md:text-8xl mt-6 mb-8">
            Let's build <span className="text-gradient-gold italic">the future</span> together
          </h1>
          <p className="text-xl font-serif text-ink-200 max-w-2xl">
            Groovethiopia Trading PLC is committed to cultivating long-term partnerships that drive innovation across the Ethiopian market.
          </p>
        </div>
      </section>

      <ContactClient />

      <section className="px-6 py-24 border-t border-ink-800/50 mt-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <span className="label-mono">Headquarters</span>
            <p className="mt-3 text-ink-200">Addis Ababa, Ethiopia</p>
          </div>
          <div>
            <span className="label-mono">Email</span>
            <a href="mailto:hello@groovethiopia.com" className="mt-3 block text-ink-200 hover:text-gold-400 transition-colors">
              hello@groovethiopia.com
            </a>
          </div>
          <div>
            <span className="label-mono">Hours</span>
            <p className="mt-3 text-ink-200">Mon — Fri, 9:00 — 18:00 EAT</p>
          </div>
        </div>
      </section>
    </div>
  );
}