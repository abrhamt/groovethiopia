"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type LiveEvent = {
  id: string;
  slug: string;
  title: string;
  startsAt: string;
  venue?: string;
};

export function LiveEventIndicator({ locale }: { locale: string }) {
  const [event, setEvent] = useState<LiveEvent | null>(null);

  useEffect(() => {
    async function check() {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const res = await fetch(`${API}/api/public/live-events?locale=${locale}`);
        if (res.ok) {
          const data = await res.json();
          setEvent(data.event);
        }
      } catch {}
    }
    check();
    // Re-check every 5 minutes
    const interval = setInterval(check, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [locale]);

  if (!event) return null;

  return (
    <Link
      href={`/${locale}/events/${event.slug}`}
      className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 hover:border-red-500/60 transition-all group"
      title={`${event.title}${event.venue ? ` @ ${event.venue}` : ""}`}
    >
      <span className="relative flex items-center">
        <span className="absolute w-2 h-2 bg-red-500 rounded-full animate-ping" />
        <span className="relative w-2 h-2 bg-red-500 rounded-full" />
      </span>
      <span className="text-xs font-mono uppercase tracking-widest text-red-400 group-hover:text-red-300">
        Live now
      </span>
    </Link>
  );
}