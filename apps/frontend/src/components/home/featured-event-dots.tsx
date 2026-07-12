"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Scroll-aware dot indicators for the mobile featured-event carousel.
 * Uses IntersectionObserver to track which card is in view and highlights
 * the matching dot. Tapping a dot scrolls to that card.
 */
export function MobileCarouselDots({ count }: { count: number }) {
  const [active, setActive] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const scrollTo = useCallback((index: number) => {
    const carousel = document.getElementById("featured-carousel");
    if (!carousel) return;
    const cards = carousel.querySelectorAll<HTMLElement>("[data-carousel-card]");
    if (cards[index]) {
      cards[index].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, []);

  useEffect(() => {
    const carousel = document.getElementById("featured-carousel");
    if (!carousel) return;

    // Tag each direct card child so we can observe them
    const snapChildren = carousel.querySelectorAll<HTMLElement>(".snap-center");
    snapChildren.forEach((el, i) => {
      el.setAttribute("data-carousel-card", String(i));
    });

    // Track which card is most visible
    observerRef.current = new IntersectionObserver(
      (entries) => {
        let best: { idx: number; ratio: number } | null = null;
        for (const entry of entries) {
          const idx = Number(entry.target.getAttribute("data-carousel-card"));
          if (!isNaN(idx) && (best === null || entry.intersectionRatio > best.ratio)) {
            best = { idx, ratio: entry.intersectionRatio };
          }
        }
        if (best && best.ratio > 0.5) {
          setActive(best.idx);
        }
      },
      { root: carousel, threshold: [0, 0.5, 1] }
    );

    snapChildren.forEach((el) => observerRef.current!.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [count]);

  if (count <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-2 px-4">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => scrollTo(i)}
          aria-label={`Go to event ${i + 1}`}
          className={`rounded-full transition-all duration-300 ${
            i === active
              ? "w-6 h-2 bg-gold-500"
              : "w-2 h-2 bg-ink-600 hover:bg-ink-400"
          }`}
        />
      ))}
    </div>
  );
}
