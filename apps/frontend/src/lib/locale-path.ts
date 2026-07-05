// Locale-aware path helpers.
//
// Use these when an internal link inside the public site could otherwise
// 404 under non-default locales. Since `localePrefix: "as-needed"` is
// configured in `i18n/routing.ts`, an href like "/about" works for English
// but fails for /am/about — these helpers normalize paths so they always
// resolve to the active locale segment.

/**
 * Server-safe: prefix any site-relative path with the given locale.
 * If `path` is empty, returns the locale root.
 * If `path` already has a leading locale segment, it is left untouched.
 */
export function localePath(locale: string, path: string): string {
    if (!path) return `/${locale}`;
    if (!path.startsWith("/")) path = `/${path}`;
    // Detect any existing locale prefix (en, am, fr, es) and replace it.
    const seg = path.split("/")[1];
    if (["en", "am", "fr", "es"].includes(seg)) {
        return `/${locale}${path.slice(seg.length + 1)}`;
    }
    return `/${locale}${path}`;
}