import { prisma } from "@groovethiopia/db";
import { PartnerForm } from "@/components/admin/partner-form";

export default async function PartnersPage() {
  const partners = await prisma.partner.findMany({
    orderBy: [{ tier: "asc" }, { displayOrder: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-semibold mb-2">Partners</h1>
        <p className="text-ink-400">Strategic, cultural, and media partners</p>
      </div>

      <PartnerForm />

      <div className="grid gap-4">
        {partners.map((p) => (
          <div key={p.id} className="admin-card flex items-center gap-4">
            <div className="w-16 h-16 bg-ink-800 rounded-lg flex items-center justify-center text-2xl text-gold-400">
              {p.name[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{p.name}</h3>
                {p.isFeatured && <span className="admin-badge-published">Featured</span>}
              </div>
              <p className="text-xs text-ink-400">{p.tier.toLowerCase()} · {p.description}</p>
            </div>
            {p.logoUrl && <img src={p.logoUrl} alt={p.name} className="w-20 h-12 object-contain" />}
          </div>
        ))}
      </div>
    </div>
  );
}