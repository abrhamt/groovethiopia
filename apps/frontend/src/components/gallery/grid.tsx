"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { ContentItem } from "@/lib/api";

type GalleryItem = ContentItem & { division: "events" | "collection" | "sanctuary" };

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || "en";
  const [filter, setFilter] = useState<"all" | "events" | "collection" | "sanctuary">("all");
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  const filtered = filter === "all" ? items : items.filter((i) => i.division === filter);

  const detailHref = (item: GalleryItem) => {
    const base = `/${locale}/${item.division}/${item.slug}`;
    return base;
  };

  return (
    <>
      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-12 flex-wrap">
        {(["all", "events", "collection", "sanctuary"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-medium transition-all",
              filter === f
                ? "bg-gold-500 text-ink-900"
                : "border border-ink-700 text-ink-300 hover:border-gold-500 hover:text-gold-400"
            )}
          >
            {f === "all" ? "All" : f === "events" ? "Events" : f === "collection" ? "Collection" : "Sanctuary"}
          </button>
        ))}
      </div>

      {/* Masonry grid */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
        {filtered.map((item, i) => (
          <button
            key={item.id}
            onClick={() => router.push(detailHref(item))}
            className={cn(
              "block w-full text-left break-inside-avoid group relative overflow-hidden rounded-xl bg-ink-900 cursor-pointer",
              i % 3 === 0 ? "aspect-[4/5]" : i % 3 === 1 ? "aspect-[3/4]" : "aspect-square"
            )}
          >
            {item.image && (
              <img
                src={item.image.url}
                alt={item.image.altText || item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-4 left-4 right-4 text-left">
                <p className="text-xs font-mono uppercase tracking-widest text-gold-400 mb-1">{item.division}</p>
                <p className="font-serif text-lg">{item.title}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && lightbox.image && (
        <div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center p-6"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightbox.image.url}
              alt={lightbox.image.altText || lightbox.title}
              className="w-full max-h-[85vh] object-contain rounded-xl"
            />
            <div className="mt-4 flex items-center justify-between text-sm">
              <div>
                <span className="label-mono mr-3">{lightbox.division}</span>
                <span className="font-serif">{lightbox.title}</span>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href={detailHref(lightbox)}
                  className="text-gold-400 hover:text-gold-300 font-mono uppercase tracking-widest text-xs"
                >
                  Open →
                </a>
                <button onClick={() => setLightbox(null)} className="text-ink-400 hover:text-gold-400">
                  Close ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}