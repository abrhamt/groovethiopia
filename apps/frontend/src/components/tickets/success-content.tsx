"use client";

import { useSearchParams, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";

export function SuccessContent() {
  const params = useParams();
  const search = useSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd verify the session with Stripe here
    // For now, just show success
    const sessionId = search.get("session_id");
    const simulated = search.get("simulated");
    setData({ sessionId, simulated, ticketType: "GENERAL", quantity: 1 });
    setLoading(false);
  }, [search]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-gold-500/10 border-2 border-gold-500/30 flex items-center justify-center">
          <Check size={40} className="text-gold-400" />
        </div>
        <p className="label-mono mb-4">Tickets Confirmed</p>
        <h1 className="editorial-heading text-5xl md:text-7xl mb-6">
          You're going
        </h1>
        <p className="text-ink-300 mb-8 font-serif">
          Your tickets have been emailed. Keep this confirmation for your records.
        </p>
        {data?.simulated && (
          <p className="text-xs text-ink-500 mb-8 font-mono">
            [DEMO MODE — no real payment was processed]
          </p>
        )}
        <div className="flex items-center justify-center gap-3">
          <a href={`/${params.locale}/events`} className="btn-primary">
            Browse more events
          </a>
          <a href={`/${params.locale}`} className="btn-ghost">
            Home
          </a>
        </div>
      </div>
    </div>
  );
}