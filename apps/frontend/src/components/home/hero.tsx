"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowDown } from "lucide-react";

export function Hero() {
  const t = useTranslations("home.hero");
  const tNav = useTranslations("nav");

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 animate-fade-in"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=2400&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        <div className="absolute inset-0 grain" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center pt-32">
        <div className="mb-8 animate-fade-up">
          <span className="label-mono">A Curated Ecosystem</span>
        </div>

        <h1 className="editorial-heading text-6xl md:text-8xl lg:text-9xl mb-8 animate-fade-up">
          <span className="block text-foreground">{t("tagline").split(" ").slice(0, 2).join(" ")}</span>
          <span className="block text-gradient-gold italic">{t("tagline").split(" ").slice(2).join(" ")}</span>
        </h1>

        <p className="text-lg md:text-xl text-ink-200 max-w-2xl mx-auto mb-12 font-serif font-light animate-fade-up">
          {t("subtitle")}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up">
          <Link href="/divisions" className="btn-primary">
            {t("cta")}
          </Link>
          <Link href="/contact" className="btn-ghost">
            Partner with us
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 animate-fade-in">
        <div className="flex flex-col items-center gap-2 text-ink-400">
          <ArrowDown size={20} className="animate-bounce" />
        </div>
      </div>
    </section>
  );
}