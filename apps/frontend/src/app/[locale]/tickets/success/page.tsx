import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { SuccessContent } from "@/components/tickets/success-content";

export const dynamic = "force-dynamic";

export default async function TicketSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string; simulated?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}