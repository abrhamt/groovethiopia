"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/site/logo";
import { LanguageSwitcher } from "@/components/site/language-switcher";

export function Nav() {
  const t = useTranslations("nav");
  const tBrand = useTranslations("brand");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const params = useParams();
  const locale = (params.locale as string) || "en";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide nav on /admin
  if (pathname.includes("/admin")) return null;

  const links = [
    { href: `/${locale}`, label: t("home") },
    { href: `/${locale}/about`, label: t("about") },
    { href: `/${locale}/divisions`, label: t("divisions") },
    { href: `/${locale}/events`, label: t("events") },
    { href: `/${locale}/collection`, label: t("trading") },
    { href: `/${locale}/sanctuary`, label: t("realEstate") },
    { href: `/${locale}/gallery`, label: t("gallery") },
    { href: `/${locale}/partners`, label: t("partners") },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled ? "glass-nav py-3" : "py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href={`/${locale}`} className="z-10">
          <Logo />
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "text-sm font-medium tracking-wide transition-colors relative",
                  active ? "text-gold-400" : "text-ink-200 hover:text-foreground"
                )}
              >
                {l.label}
                {active && (
                  <span className="absolute -bottom-1 left-0 right-0 h-px bg-gold-500" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link href={`/${locale}/contact`} className="hidden md:inline-flex btn-primary text-sm px-5 py-2">
            {t("contact")}
          </Link>
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            <div className="space-y-1.5">
              <span className={cn("block w-6 h-px bg-current transition-all", open && "translate-y-2 rotate-45")} />
              <span className={cn("block w-6 h-px bg-current transition-all", open && "opacity-0")} />
              <span className={cn("block w-6 h-px bg-current transition-all", open && "-translate-y-2 -rotate-45")} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-ink-900 border-b border-ink-800 p-6">
          <nav className="flex flex-col gap-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-lg text-ink-200 hover:text-gold-400 transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href={`/${locale}/contact`}
              onClick={() => setOpen(false)}
              className="btn-primary text-center mt-2"
            >
              {t("contact")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}