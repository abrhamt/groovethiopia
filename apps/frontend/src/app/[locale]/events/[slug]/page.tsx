import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  try {
    const { item } = await api.getContentBySlug(slug, locale);
    if (item.type !== "EVENT" && item.type !== "SHUKSHUTA_EVENT") notFound();

    return (
      <div className="pt-32 pb-24">
        <article className="max-w-5xl mx-auto px-6">
          <div className="mb-8">
            <Link href="/events" className="text-xs font-mono uppercase tracking-widest text-gold-400 hover:text-gold-300">
              ← The Pulse
            </Link>
          </div>

          {item.image && (
            <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-12">
              <img src={item.image.url} alt={item.title} className="w-full h-full object-cover" />
            </div>
          )}

          <span className="label-mono">{item.type === "SHUKSHUTA_EVENT" ? "Shukshuta" : "Event"}</span>
          <h1 className="editorial-heading text-5xl md:text-7xl mt-4 mb-6">{item.title}</h1>

          {item.startsAt && (
            <p className="text-xl text-ink-200 font-serif mb-2">
              {formatDate(item.startsAt, locale)}
            </p>
          )}
          {item.venue && (
            <p className="text-ink-400 mb-12">{item.venue}{item.venueAddress && ` · ${item.venueAddress}`}</p>
          )}

          {item.body && (
            <div className="prose prose-invert max-w-none text-lg text-ink-200 font-serif leading-relaxed mb-12 whitespace-pre-wrap">
              {item.body}
            </div>
          )}

          <div className="border-t border-ink-800 pt-8">
            <Link href="/contact" className="btn-primary">Request Invitation</Link>
          </div>
        </article>
      </div>
    );
  } catch {
    notFound();
  }
}