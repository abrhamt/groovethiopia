import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { localePath } from "@/lib/locale-path";

export async function InquireCTA() {
  const t = await getTranslations("home.cta");
  const locale = await getLocale();
  const lp = (p: string) => localePath(locale, p);
  return (
    <section className="py-16 md:py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 grain opacity-50" />
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="editorial-heading text-3xl sm:text-4xl md:text-6xl lg:text-7xl mb-8 text-gradient-gold">
          {t("title")}
        </h2>
        <p className="text-ink-200 text-lg md:text-xl font-serif font-light leading-relaxed mb-12 max-w-2xl mx-auto">
          {t("body")}
        </p>
        <Link href={lp("/contact")} className="btn-primary text-lg px-10 py-4">
          {t("button")}
        </Link>
      </div>
    </section>
  );
}