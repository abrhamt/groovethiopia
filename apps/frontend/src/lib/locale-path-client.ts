"use client";

import { useParams } from "next/navigation";
import { localePath } from "./locale-path";

/**
 * Client hook returning the current locale string.
 * Falls back to "en" if the param is missing (e.g. on a root page).
 */
export function useCurrentLocale(): string {
    const params = useParams<{ locale?: string }>();
    return params?.locale || "en";
}

/**
 * Client hook returning a helper that prefixes a path with the active locale.
 *
 *     const lpath = useLocalePath();
 *     <Link href={lpath("/about")}>...</Link>
 */
export function useLocalePath(): (path: string) => string {
    const locale = useCurrentLocale();
    return (path: string) => localePath(locale, path);
}
