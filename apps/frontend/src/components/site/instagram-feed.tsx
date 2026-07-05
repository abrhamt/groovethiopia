"use client";

import { useEffect, useState } from "react";
import { Instagram } from "lucide-react";
import { dummyGalleryItems } from "@/lib/dummy-data";

type InstaPost = {
  id: string;
  caption?: string;
  media_url: string;
  permalink: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  thumbnail_url?: string;
  timestamp: string;
};

export function InstagramFeed({
  username,
  limit = 6,
}: {
  username: string;
  limit?: number;
}) {
  const [posts, setPosts] = useState<InstaPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const res = await fetch(`${API}/api/public/instagram/${username}?limit=${limit}`);
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
        }
      } catch { } finally {
        setLoading(false);
      }
    }
    load();
  }, [username, limit]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="aspect-square bg-ink-800 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    // Fallback to curated dummy gallery items so the home grid is always
    // visually populated even when the Instagram API is unreachable.
    const fallbackPosts: InstaPost[] = dummyGalleryItems
      .slice(0, limit)
      .map((g, i) => ({
        id: `dummy-ig-${i}`,
        caption: g.caption,
        media_url: g.url,
        permalink: g.permalink || `https://instagram.com/${username}`,
        media_type: "IMAGE" as const,
        thumbnail_url: g.thumbnailUrl,
        timestamp: new Date().toISOString(),
      }));

    return (
      <div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
          {fallbackPosts.map((post) => (
            <a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="aspect-square bg-ink-800 rounded-lg overflow-hidden group relative"
            >
              <img
                src={post.thumbnail_url || post.media_url}
                alt={post.caption || ""}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Instagram size={24} className="text-white" />
              </div>
            </a>
          ))}
        </div>
        <div className="text-center">
          <a
            href={`https://instagram.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-ink-300 hover:text-gold-400 transition-colors"
          >
            <Instagram size={16} />
            <span className="font-mono uppercase tracking-widest">Follow @{username}</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
        {posts.map((post) => (
          <a
            key={post.id}
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="aspect-square bg-ink-800 rounded-lg overflow-hidden group relative"
          >
            <img
              src={post.thumbnail_url || post.media_url}
              alt={post.caption || ""}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Instagram size={24} className="text-white" />
            </div>
          </a>
        ))}
      </div>
      <div className="text-center">
        <a
          href={`https://instagram.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-ink-300 hover:text-gold-400 transition-colors"
        >
          <Instagram size={16} />
          <span className="font-mono uppercase tracking-widest">Follow @{username}</span>
        </a>
      </div>
    </div>
  );
}