"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useParams } from "next/navigation";

const LOCALES = [
  { code: "en", label: "EN" },
  { code: "am", label: "አማ" },
  { code: "fr", label: "FR" },
  { code: "es", label: "ES" },
];

export function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  const currentLocale = (params.locale as string) || "en";

  function switchLocale(locale: string) {
    setOpen(false);
    const newPath = pathname.replace(`/${currentLocale}`, `/${locale}`);
    startTransition(() => {
      router.replace(newPath);
    });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs font-mono uppercase tracking-widest text-ink-300 hover:text-gold-400 transition-colors px-3 py-1.5 border border-ink-700 rounded-full"
        disabled={isPending}
      >
        {LOCALES.find((l) => l.code === currentLocale)?.label || "EN"}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-20 bg-ink-900 border border-ink-800 rounded-lg overflow-hidden min-w-[120px]">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                onClick={() => switchLocale(l.code)}
                className={`block w-full text-left px-4 py-2 text-xs font-mono uppercase tracking-widest transition-colors ${
                  currentLocale === l.code
                    ? "text-gold-400 bg-gold-500/10"
                    : "text-ink-300 hover:bg-ink-800 hover:text-foreground"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}