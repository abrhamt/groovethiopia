import { setRequestLocale } from "next-intl/server";

// Force dynamic rendering - this page fetches from backend
export const dynamic = "force-dynamic";

export default async function PartnersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const API = process.env.NEXT_PUBLIC_API_URL;
  const data = await fetch(`${API}/api/public/partners`, { next: { revalidate: 600 } })
    .then((r) => r.json())
    .catch(() => ({ partners: [] }));

  const partners = data.partners || [];
  const strategic = partners.filter((p: any) => p.tier === "STRATEGIC");
  const cultural = partners.filter((p: any) => p.tier !== "STRATEGIC");
  const featured = strategic.find((p: any) => p.isFeatured) || strategic[0];

  return (
    <div className="pt-32">
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <span className="label-mono">Partners</span>
          <h1 className="editorial-heading text-6xl md:text-8xl mt-6 mb-8">
            Trusted by <span className="text-gradient-gold italic">the best</span>
          </h1>
        </div>
      </section>

      {featured && (
        <section className="px-6 py-24 border-y border-ink-800/50 bg-ink-900/30">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="label-mono">Featured Partner</span>
              <h2 className="editorial-heading text-5xl mt-4 mb-6">{featured.name}</h2>
              {featured.description && (
                <p className="text-xl text-ink-200 font-serif mb-8">{featured.description}</p>
              )}
              {featured.websiteUrl && (
                <a href={featured.websiteUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                  Visit website
                </a>
              )}
            </div>
            <div className="aspect-square rounded-2xl bg-ink-800 flex items-center justify-center">
              <span className="text-9xl font-serif text-gold-400">{featured.name[0]}</span>
            </div>
          </div>
        </section>
      )}

      <section className="px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <h2 className="editorial-heading text-4xl mb-12">Strategic partners</h2>
          {strategic.length === 0 ? (
            <p className="text-ink-400">No strategic partners listed.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {strategic.map((p: any) => (
                <div key={p.id} className="p-8 border border-ink-800 rounded-2xl bg-ink-900/40 flex flex-col items-center justify-center aspect-video">
                  <span className="text-3xl font-serif text-gold-400 mb-2">{p.name[0]}</span>
                  <p className="text-center text-sm text-ink-300">{p.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="px-6 py-24 border-t border-ink-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="editorial-heading text-4xl mb-12">Cultural & media partners</h2>
          {cultural.length === 0 ? (
            <p className="text-ink-400">No cultural partners listed.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {cultural.map((p: any) => (
                <div key={p.id} className="p-6 border border-ink-800 rounded-2xl bg-ink-900/40 flex flex-col items-center justify-center aspect-square">
                  <span className="text-2xl font-serif text-gold-400 mb-2">{p.name[0]}</span>
                  <p className="text-center text-xs text-ink-300">{p.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}