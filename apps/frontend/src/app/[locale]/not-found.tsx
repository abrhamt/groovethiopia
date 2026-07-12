import Link from "next/link";
import { useLocale } from "next-intl";

export default function NotFound() {
  const locale = useLocale();

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="label-mono mb-4">404 · Not Found</p>
        <h1 className="editorial-heading text-5xl sm:text-6xl md:text-8xl lg:text-9xl mb-6 text-gradient-gold">
          Lost
        </h1>
        <p className="text-ink-300 mb-8 font-serif">
          The page you're looking for has wandered off into the horizon.
        </p>
        <Link href={`/${locale}`} className="btn-primary">
          Return home
        </Link>
      </div>
    </div>
  );
}