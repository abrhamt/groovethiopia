import { setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { api } from "@/lib/api";
import { dummyEvents, findDummyBySlug } from "@/lib/dummy-data";
import { CheckoutClient } from "@/components/tickets/checkout-client";
import type { ContentItem } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ event?: string; eventId?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { event: eventSlug, eventId } = await searchParams;
  const targetKey = eventSlug || eventId;

  if (!targetKey) {
    redirect(`/${locale}/events`);
  }

  let item: ContentItem | null = null;

  // 1. Try to fetch by slug from backend
  try {
    const res = await api.getContentBySlug(targetKey, locale);
    item = res.item;
  } catch {
    // 2. Try fetching all contents and finding matching ID or slug if backend is active
    try {
      const res = await api.getContent({ type: "EVENT", locale });
      item = res.items.find(x => x.id === targetKey || x.slug === targetKey) || null;
      if (!item) {
        const shukshutaRes = await api.getContent({ type: "SHUKSHUTA_EVENT", locale });
        item = shukshutaRes.items.find(x => x.id === targetKey || x.slug === targetKey) || null;
      }
    } catch {
      // API offline
    }
  }

  // 3. Fallback to dummy data
  if (!item) {
    const dummy = findDummyBySlug(dummyEvents, targetKey);
    if (dummy) {
      item = dummy;
    } else {
      item = dummyEvents.find(x => x.id === targetKey) || null;
    }
  }

  if (!item) {
    notFound();
  }

  return <CheckoutClient event={item} />;
}
