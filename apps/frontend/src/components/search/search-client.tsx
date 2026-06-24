"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";

type Result = {
  id: string;
  type: string;
  slug: string;
  title: string;
  subtitle?: string;
  excerpt?: string;
  venue?: string;
  year?: number;
  make?: string;
  model?: string;
  price?: string;
  location?: string;
  startsAt?: string;
  image?: { url: string; thumbnailUrl: string };
};

export function SearchClient() {
  const params = useParams();
  const search = useSearchParams();
  const router = useRouter();
  const locale = (params.locale as string) || "en";

  const [query, setQuery] = useState(search.get("q") || "");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.length < 2) {
      setResults([]);
      setTotal(0);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const res = await fetch(`${API}/api/public/search?q=${encodeURIComponent(query)}&locale=${locale}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.items);
          setTotal(data.total);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, locale]);

  function clearSearch() {
    setQuery("");
    setResults([]);
  }

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <span className="label-mono">Search</span>
        <h1 className="editorial-heading text-5xl md:text-7xl mt-4 mb-12">
          Find what <span className="text-gradient-gold italic">matters</span>
        </h1>

        <div className="relative mb-12">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gold-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events, vehicles, projects..."
            className="w-full pl-16 pr-16 py-5 bg-ink-900 border border-ink-700 rounded-2xl focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 text-lg"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-ink-400 hover:text-gold-400"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {loading && (
          <div className="text-center py-12 text-ink-400">Searching...</div>
        )}

        {!loading && query.length >= 2 && (
          <p className="text-sm text-ink-400 mb-6">
            {total} {total === 1 ? "result" : "results"} for "{query}"
          </p>
        )}

        <div className="space-y-3">
          {results.map((r) => (
            <SearchResult key={r.id} result={r} locale={locale} />
          ))}
        </div>

        {!loading && query.length >= 2 && results.length === 0 && (
          <div className="text-center py-16 text-ink-400">
            No results. Try different keywords.
          </div>
        )}

        {!query && (
          <div className="text-center py-16 text-ink-400">
            Start typing to search.
          </div>
        )}
      </div>
    </div>
  );
}

function SearchResult({ result, locale }: { result: Result; locale: string }) {
  const href =
    result.type === "EVENT" || result.type === "SHUKSHUTA_EVENT" ? `/${locale}/events/${result.slug}` :
    result.type === "VEHICLE" ? `/${locale}/collection/${result.slug}` :
    result.type === "REAL_ESTATE_PROJECT" ? `/${locale}/sanctuary/${result.slug}` :
    `/${locale}`;

  const typeLabel =
    result.type === "EVENT" ? "Event" :
    result.type === "SHUKSHUTA_EVENT" ? "Shukshuta" :
    result.type === "VEHICLE" ? "Collection" :
    result.type === "REAL_ESTATE_PROJECT" ? "Sanctuary" :
    "Page";

  return (
    <Link href={href} className="admin-card flex gap-4 hover:border-gold-500/50">
      {result.image && (
        <div className="w-32 h-32 rounded-lg overflow-hidden bg-ink-800 shrink-0">
          <img src={result.image.thumbnailUrl || result.image.url} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <span className="label-mono">{typeLabel}</span>
        <h3 className="font-serif text-xl mt-1 mb-1">{result.title}</h3>
        {result.excerpt && (
          <p className="text-sm text-ink-300 line-clamp-2">{result.excerpt}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-ink-400 mt-2">
          {result.venue && <span>{result.venue}</span>}
          {result.startsAt && <span>{formatDate(result.startsAt, locale)}</span>}
          {result.year && <span>{result.year} {result.make} {result.model}</span>}
          {result.location && <span>{result.location}</span>}
          {result.price && <span className="text-gold-400">{formatPrice(result.price)}</span>}
        </div>
      </div>
    </Link>
  );
}