export function PartnersStrip({ partners }: { partners: Array<{ name: string; logoUrl?: string; tier: string }> }) {
  // Use sample partners if none returned
  const displayPartners = partners.length > 0 ? partners : [
    { name: "NIB International Bank", tier: "STRATEGIC" },
    { name: "Hyatt Regency", tier: "STRATEGIC" },
    { name: "Sheraton Addis", tier: "CULTURAL" },
    { name: "Addis Ababa University", tier: "CULTURAL" },
    { name: "Ethiopian Airlines", tier: "STRATEGIC" },
    { name: "Kana TV", tier: "MEDIA" },
  ];

  return (
    <section className="py-24 px-6 border-y border-ink-800/50 overflow-hidden">
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <span className="label-mono">Trusted by</span>
      </div>
      <div className="relative">
        <div className="flex gap-16 animate-marquee whitespace-nowrap">
          {[...displayPartners, ...displayPartners].map((p, i) => (
            <div key={i} className="flex items-center gap-3 shrink-0">
              <div className="w-12 h-12 rounded-full border border-ink-700 flex items-center justify-center text-gold-400 font-serif">
                {p.name[0]}
              </div>
              <span className="text-ink-300 font-serif text-lg">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function InstagramSection({ username = "groovethiopia" }: { username?: string }) {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="label-mono">Follow the journey</span>
          <h2 className="editorial-heading text-4xl md:text-5xl mt-3">From the inside</h2>
        </div>
        <InstagramFeed username={username} limit={6} />
      </div>
    </section>
  );
}

import { InstagramFeed } from "@/components/site/instagram-feed";