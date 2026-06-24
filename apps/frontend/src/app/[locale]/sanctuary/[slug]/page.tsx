import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  try {
    const { item } = await api.getContentBySlug(slug, locale);
    if (item.type !== "REAL_ESTATE_PROJECT") notFound();

    return (
      <div className="pt-32 pb-24">
        <article className="max-w-5xl mx-auto px-6">
          <div className="mb-8">
            <Link href="/sanctuary" className="text-xs font-mono uppercase tracking-widest text-gold-400 hover:text-gold-300">
              ← The Sanctuary
            </Link>
          </div>

          {item.image && (
            <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-12">
              <img src={item.image.url} alt={item.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex items-center gap-3 mb-6">
            {item.projectStage && <span className="admin-badge-published text-xs">{item.projectStage.toLowerCase()}</span>}
            {item.location && <span className="text-ink-400 text-sm">{item.location}</span>}
          </div>

          <h1 className="editorial-heading text-5xl md:text-7xl mb-8">{item.title}</h1>

          {item.excerpt && (
            <p className="text-2xl font-serif text-ink-200 leading-relaxed mb-12">
              {item.excerpt}
            </p>
          )}

          {item.body && (
            <div className="text-lg text-ink-300 font-serif leading-relaxed whitespace-pre-wrap mb-12">
              {item.body}
            </div>
          )}

          <div className="border-t border-ink-800 pt-8">
            <Link href="/contact" className="btn-primary">Explore Investment</Link>
          </div>
        </article>
      </div>
    );
  } catch {
    notFound();
  }
}