import Link from "next/link";
import { prisma } from "@groovethiopia/db";
import { formatDateTime } from "@/lib/utils";

export default async function PagesAdminPage() {
  const pages = await prisma.content.findMany({
    where: { type: "PAGE" },
    orderBy: { updatedAt: "desc" },
    include: { author: { select: { name: true, email: true } } },
  });

  // Static page sections (special type=page entries)
  const staticSections = [
    { slug: "homepage-hero", title: "Homepage Hero", desc: "Main tagline + CTA" },
    { slug: "homepage-manifesto", title: "Homepage Manifesto", desc: "Manifesto teaser block" },
    { slug: "about-manifesto", title: "About Manifesto", desc: "Full manifesto on About page" },
    { slug: "about-story", title: "About Story", desc: "Our story section" },
    { slug: "about-values", title: "About Values", desc: "Values list" },
    { slug: "events-tagline", title: "Events Page Tagline", desc: "Headline on Events page" },
    { slug: "collection-tagline", title: "Collection Tagline", desc: "Headline on Collection page" },
    { slug: "sanctuary-vision", title: "Sanctuary Vision", desc: "Vision statement" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-semibold mb-2">Pages</h1>
          <p className="text-ink-400">Edit static page content (homepage sections, about copy, etc.)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {staticSections.map((s) => {
          const existing = pages.find((p) => p.slug === s.slug);
          return (
            <Link
              key={s.slug}
              href={`/pages/${existing?.id || "new"}?slug=${s.slug}&title=${encodeURIComponent(s.title)}`}
              className="admin-card hover:border-gold-500/40 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-serif text-xl mb-1">{s.title}</h3>
                  <p className="text-sm text-ink-400">{s.desc}</p>
                </div>
                <span className="admin-badge-draft">
                  {existing ? existing.status.toLowerCase().replace("_", " ") : "not set"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {pages.length > 0 && (
        <div className="mt-12">
          <h2 className="font-serif text-xl mb-4">All page content</h2>
          <div className="admin-card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-800 text-left">
                  <th className="px-5 py-3 font-mono text-xs uppercase tracking-widest text-ink-400">Title</th>
                  <th className="px-5 py-3 font-mono text-xs uppercase tracking-widest text-ink-400">Slug</th>
                  <th className="px-5 py-3 font-mono text-xs uppercase tracking-widest text-ink-400">Locale</th>
                  <th className="px-5 py-3 font-mono text-xs uppercase tracking-widest text-ink-400">Status</th>
                  <th className="px-5 py-3 font-mono text-xs uppercase tracking-widest text-ink-400">Updated</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((p) => (
                  <tr key={p.id} className="border-b border-ink-800/50 last:border-0 hover:bg-ink-800/30">
                    <td className="px-5 py-3">
                      <Link href={`/pages/${p.id}`} className="hover:text-gold-400">{p.title}</Link>
                    </td>
                    <td className="px-5 py-3 text-xs font-mono text-ink-400">{p.slug}</td>
                    <td className="px-5 py-3 text-xs">{p.locale}</td>
                    <td className="px-5 py-3">
                      <span className={`admin-badge-${p.status === "PUBLISHED" ? "published" : "draft"}`}>
                        {p.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-ink-400">{formatDateTime(p.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}