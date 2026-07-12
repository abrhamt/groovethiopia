import { setRequestLocale } from "next-intl/server";
import { dummyPartners, withFallback } from "@/lib/dummy-data";
import { PartnerLogo } from "@/components/site/partner-logo";

// Force dynamic rendering - this page fetches from backend
export const dynamic = "force-dynamic";

export default async function PartnersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const API = process.env.NEXT_PUBLIC_API_URL;
  const data = await fetch(`${API}/api/public/partners`, { next: { revalidate: 600 } })
    .then((r) => r.json())
    .catch(() => ({ partners: [] }));

  const apiPartners = data.partners || [];
  const partners = withFallback(apiPartners, dummyPartners);
  const strategic = partners.filter((p: any) => p.tier === "STRATEGIC");
  const cultural = partners.filter((p: any) => p.tier !== "STRATEGIC");
  const featured = strategic.find((p: any) => p.isFeatured) || strategic[0];

  return (
    <div className="pt-28 md:pt-32">
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <span className="label-mono">Partners</span>
          <h1 className="editorial-heading text-4xl sm:text-5xl md:text-7xl lg:text-8xl mt-6 mb-8">
            Trusted by <span className="text-gradient-gold italic">the best</span>
          </h1>
          <p className="text-lg text-ink-300 font-serif max-w-2xl">
            A curated network of institutions, brands, and media houses that
            stand behind everything we curate.
          </p>
        </div>
      </section>

      {featured && (
        <section className="px-6 py-16 md:py-24 border-y border-ink-800/50 bg-ink-900/30">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="label-mono">Featured Partner</span>
              <h2 className="editorial-heading text-3xl sm:text-4xl md:text-5xl mt-4 mb-6">
                {featured.name}
              </h2>
              {featured.description && (
                <p className="text-xl text-ink-200 font-serif mb-8">
                  {featured.description}
                </p>
              )}
              {featured.websiteUrl && (
                <a
                  href={featured.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                >
                  Visit website
                </a>
              )}
            </div>
            <div className="flex items-center justify-center">
              <PartnerLogo partner={featured} size="xl" />
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {strategic.map((p: any) => (
                <div
                  key={p.id}
                  className="p-8 border border-ink-800 rounded-2xl bg-ink-900/40 flex flex-col items-center justify-center aspect-video gap-3 hover:border-gold-500/40 transition-colors"
                >
                  <PartnerLogo partner={p} size="md" />
                  <p className="text-center text-sm text-ink-300 font-medium">
                    {p.name}
                  </p>
                  {p.tier && (
                    <span className="text-[10px] font-mono tracking-widest text-gold-400/70 uppercase">
                      {p.tier}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="px-6 py-24 border-t border-ink-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="editorial-heading text-4xl mb-12">
            Cultural & media partners
          </h2>
          {cultural.length === 0 ? (
            <p className="text-ink-400">No cultural partners listed.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {cultural.map((p: any) => (
                <div
                  key={p.id}
                  className="p-6 border border-ink-800 rounded-2xl bg-ink-900/40 flex flex-col items-center justify-center aspect-square gap-3 hover:border-gold-500/40 transition-colors"
                >
                  <PartnerLogo partner={p} size="md" showCaption />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
