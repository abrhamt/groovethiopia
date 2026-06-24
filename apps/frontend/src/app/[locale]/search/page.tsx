import { setRequestLocale } from "next-intl/server";
import { SearchClient } from "@/components/search/search-client";

export const dynamic = "force-dynamic";

export default function SearchPage({ params }: { params: Promise<{ locale: string }> }) {
  return <SearchClientWrapper params={params} />;
}

async function SearchClientWrapper({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SearchClient />;
}