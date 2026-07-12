"use client";

import { useState, useEffect, useMemo } from "react";

export type EventMediaItem = {
  id: string;
  image?: {
    url: string;
  };
  media?: Array<{
    url: string;
  }>;
};

export function Hero({ events }: { events?: EventMediaItem[] }) {
  const mediaList = useMemo(() => {
    const list: { url: string; isVideo: boolean }[] = [];

    if (events && events.length > 0) {
      events.forEach((e) => {
        if (e.image?.url) {
          list.push({ url: e.image.url, isVideo: false });
        }
        if (e.media && Array.isArray(e.media)) {
          e.media.forEach((m) => {
            if (m.url) {
              const isVideo =
                m.url.toLowerCase().endsWith(".mp4") ||
                m.url.toLowerCase().endsWith(".webm") ||
                m.url.toLowerCase().endsWith(".mov");
              list.push({ url: m.url, isVideo });
            }
          });
        }
      });
    }

    // Default fallbacks if no events or no images
    if (list.length === 0) {
      list.push(
        { url: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1600&q=80", isVideo: false },
        { url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80", isVideo: false },
        { url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&q=80", isVideo: false }
      );
    }

    // Deduplicate list by URL
    const uniqueList: typeof list = [];
    const seen = new Set<string>();
    list.forEach((item) => {
      if (!seen.has(item.url)) {
        seen.add(item.url);
        uniqueList.push(item);
      }
    });

    return uniqueList;
  }, [events]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (mediaList.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % mediaList.length);
    }, 6000); // 6 seconds per item
    return () => clearInterval(interval);
  }, [mediaList]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Media Slideshow */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {mediaList.map((item, i) => {
          const isActive = i === index;
          if (item.isVideo) {
            return (
              <video
                key={item.url}
                src={item.url}
                autoPlay
                loop
                muted
                playsInline
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                  isActive ? "opacity-100 z-10 animate-kenburns" : "opacity-0 z-0"
                }`}
              />
            );
          } else {
            return (
              <div
                key={item.url}
                className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
                  isActive ? "opacity-100 z-10 animate-kenburns" : "opacity-0 z-0"
                }`}
                style={{ backgroundImage: `url(${item.url})` }}
              />
            );
          }
        })}

        {/* Dark elegant overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background z-20" />
        <div className="absolute inset-0 bg-black/40 z-20" />
        <div className="absolute inset-0 grain z-20" />
      </div>

      {/* Content */}
      <div className="relative z-30 max-w-6xl mx-auto px-6 text-center pt-28 md:pt-32">
        <div className="mb-8 animate-fade-up">
          <span className="label-mono tracking-[0.25em] text-gold-400 text-xs md:text-sm">
            EST. 2019 &middot; ADDIS ABABA
          </span>
        </div>

        <h1 className="editorial-heading text-4xl sm:text-6xl md:text-8xl lg:text-9xl mb-8 animate-fade-up text-foreground">
          Curating the{" "}
          <br className="hidden sm:inline" />
          <span className="text-gradient-gold italic font-serif">New Horizon</span>
        </h1>
      </div>

      <style>{`
        @keyframes kenburns {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.1);
          }
        }
        .animate-kenburns {
          animation: kenburns 6.5s ease-out forwards;
        }
      `}</style>
    </section>
  );
}