import Link from "next/link";
import { useTranslations } from "next-intl";
import { Logo } from "./logo";
import { Instagram, Send, Music2, Twitter } from "lucide-react";

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tBrand = useTranslations("brand");

  return (
    <footer className="border-t border-ink-800 mt-32 bg-ink-900/40">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-6 text-sm text-ink-300 max-w-md leading-relaxed font-serif italic">
              {tBrand("tagline")}
            </p>
            <div className="mt-8 flex items-center gap-4">
              <SocialLink href="https://instagram.com/groovethiopia" icon={<Instagram size={18} />} label="Instagram" />
              <SocialLink href="https://t.me/groovethiopia" icon={<Send size={18} />} label="Telegram" />
              <SocialLink href="https://tiktok.com/@groovethiopia" icon={<Music2 size={18} />} label="TikTok" />
              <SocialLink href="https://x.com/groovethiopia" icon={<Twitter size={18} />} label="X" />
            </div>
          </div>

          <div>
            <h4 className="label-mono mb-4">{t("explore")}</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="text-ink-300 hover:text-gold-400 transition-colors">{tNav("about")}</Link></li>
              <li><Link href="/events" className="text-ink-300 hover:text-gold-400 transition-colors">{tNav("events")}</Link></li>
              <li><Link href="/collection" className="text-ink-300 hover:text-gold-400 transition-colors">{tNav("trading")}</Link></li>
              <li><Link href="/sanctuary" className="text-ink-300 hover:text-gold-400 transition-colors">{tNav("realEstate")}</Link></li>
              <li><Link href="/gallery" className="text-ink-300 hover:text-gold-400 transition-colors">{tNav("gallery")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="label-mono mb-4">{t("connect")}</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/contact" className="text-ink-300 hover:text-gold-400 transition-colors">{tNav("contact")}</Link></li>
              <li><Link href="/partners" className="text-ink-300 hover:text-gold-400 transition-colors">{tNav("partners")}</Link></li>
              <li>
                <a href="mailto:hello@groovethiopia.com" className="text-ink-300 hover:text-gold-400 transition-colors">
                  hello@groovethiopia.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-ink-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ink-500 font-mono uppercase tracking-widest">
            © {new Date().getFullYear()} Groovethiopia Trading PLC. {t("rights")}
          </p>
          <div className="flex items-center gap-6 text-xs text-ink-500">
            <Link href="/legal/privacy" className="hover:text-gold-400 transition-colors">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-gold-400 transition-colors">Terms</Link>
            <Link href="/legal/cookies" className="hover:text-gold-400 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-10 h-10 rounded-full border border-ink-700 flex items-center justify-center text-ink-300 hover:border-gold-500 hover:text-gold-400 transition-all"
    >
      {icon}
    </a>
  );
}