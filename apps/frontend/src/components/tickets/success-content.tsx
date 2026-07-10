"use client";

// Success page. Loads the checkout status (which returns every ticket in the
// order group), renders one card per ticket, and lets the visitor download /
// copy each QR independently. Tickets are also persisted to localStorage so
// they survive a refresh on the same device.

import { useSearchParams, useParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import {
  Check, ShieldCheck, Calendar, MapPin, Copy, Download, Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import { generateQRCodeSVG } from "@/lib/qr";
import { formatDate } from "@/lib/utils";

type Pass = {
  ticketId: string;
  serialNumber: string;
  ticketType: string;
  qrPayloadBase64: string;
  payload: any;
  publicKey: string;
  event: {
    title?: string;
    startsAt?: string;
    endsAt?: string;
    venue?: string;
    venueAddress?: string;
  } | null;
};

type StatusResponse = {
  id: string;
  status: string;
  quantity: number;
  tickets: Array<{
    id: string;
    serialNumber: string;
    ticketType: string;
    status: string;
  }>;
  passes: Pass[];
};

const STORAGE_KEY = "groovethiopia_tickets";

type StoredTicket = {
  id: string;
  serialNumber: string;
  ticketType: string;
  qrPayloadBase64: string;
  savedAt: string;
};

function loadStoredTickets(): StoredTicket[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function persistTicket(t: StoredTicket) {
  const list = loadStoredTickets();
  if (!list.some((x) => x.id === t.id)) {
    list.push(t);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}

export function SuccessContent() {
  const params = useParams();
  const search = useSearchParams();
  const sessionId = search.get("order") || search.get("session_id");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<StatusResponse | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("No transaction reference found.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const res = await api.getCheckoutStatus(sessionId);
        if (cancelled) return;
        if (res.status !== "TICKET_ISSUED") {
          setError("Payment is still processing. Please refresh in a moment.");
          setLoading(false);
          return;
        }
        setData(res);
        setLoading(false);
      } catch (e: any) {
        if (cancelled) return;
        setError(e.message || "Unable to retrieve your gate pass.");
        setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  useEffect(() => {
    if (!data) return;
    for (const p of data.passes) {
      persistTicket({
        id: p.ticketId,
        serialNumber: p.serialNumber,
        ticketType: p.ticketType,
        qrPayloadBase64: p.qrPayloadBase64,
        savedAt: new Date().toISOString(),
      });
    }
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-gold-400 animate-spin" />
          <p className="label-mono text-gold-400">Issuing your gate pass…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-6">
        <div className="text-center max-w-md p-8 border border-red-500/20 rounded-2xl bg-red-950/10">
          <p className="text-red-400 font-serif text-lg mb-6">{error}</p>
          <a href={`/${params.locale}/events`} className="btn-primary">
            Browse events
          </a>
        </div>
      </div>
    );
  }

  const total = data.passes.length;
  const event0 = data.passes[0]?.event;

  return (
    <div className="min-h-screen pt-20 pb-24 px-4 md:px-8 bg-black text-foreground">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center">
            <Check size={26} className="text-gold-400" />
          </div>
          <span className="label-mono text-gold-400 text-xs tracking-widest uppercase">
            Payment confirmed
          </span>
          <h1 className="editorial-heading text-3xl md:text-5xl mt-2 text-white">
            {total === 1 ? "Your gate pass" : `Your ${total} gate passes`}
          </h1>
          {event0?.title && (
            <p className="text-ink-200 font-serif text-lg mt-2">{event0.title}</p>
          )}
          <p className="text-ink-400 font-serif italic mt-1">
            Each QR below is independent — present any one of them at the gate.
          </p>
        </div>

        {/* Ticket cards */}
        <div className="space-y-6">
          {data.passes.map((p, idx) => (
            <TicketCard
              key={p.ticketId}
              index={idx + 1}
              total={total}
              pass={p}
              locale={String(params.locale)}
            />
          ))}
        </div>

        <div className="mt-12 flex items-center justify-center gap-3 text-[11px] font-mono text-ink-500 uppercase tracking-wider">
          <ShieldCheck size={14} className="text-gold-400" />
          Signed offline · Saved to this device
        </div>

        <div className="mt-8 text-center">
          <a href={`/${params.locale}/events`} className="btn-ghost text-xs">
            Browse more events
          </a>
        </div>
      </div>
    </div>
  );
}

function TicketCard({
  index,
  total,
  pass,
  locale,
}: {
  index: number;
  total: number;
  pass: Pass;
  locale: string;
}) {
  const qrSvg = useMemo(() => {
    try {
      return generateQRCodeSVG(pass.qrPayloadBase64, 260);
    } catch {
      return "";
    }
  }, [pass.qrPayloadBase64]);

  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(pass.qrPayloadBase64);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleDownload() {
    if (!qrSvg) return;
    const blob = new Blob([qrSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `groovethiopia-${pass.serialNumber}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <article className="card overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <span className="label-mono">
            Ticket {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <span className="text-[10px] font-mono text-gold-400 tracking-wider">
            {pass.serialNumber}
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0 w-full md:w-auto flex justify-center">
            <div className="p-3 rounded-2xl bg-ink-950 border border-ink-800">
              {qrSvg ? (
                <div
                  className="w-[220px] h-[220px] rounded-lg overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
              ) : (
                <div className="w-[220px] h-[220px] flex items-center justify-center text-ink-500">
                  <Loader2 className="animate-spin" />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 w-full">
            <h3 className="font-serif text-xl text-white mb-3">
              {pass.ticketType?.charAt(0) +
                pass.ticketType?.slice(1).toLowerCase() + " Admission"}
            </h3>
            {pass.event?.startsAt && (
              <p className="flex items-center gap-2 text-sm text-ink-300 mb-1.5">
                <Calendar size={14} className="text-gold-400" />
                {formatDate(pass.event.startsAt, locale)}
              </p>
            )}
            {pass.event?.venue && (
              <p className="flex items-start gap-2 text-sm text-ink-300 mb-4">
                <MapPin size={14} className="text-gold-400 mt-0.5 flex-shrink-0" />
                <span>
                  {pass.event.venue}
                  {pass.event.venueAddress && (
                    <span className="block text-xs text-ink-500 mt-0.5">
                      {pass.event.venueAddress}
                    </span>
                  )}
                </span>
              </p>
            )}

            <div className="flex flex-wrap gap-2 mt-4">
              <button
                type="button"
                onClick={handleDownload}
                className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2"
              >
                <Download size={14} />
                {saved ? "Saved" : "Download QR"}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="btn-ghost text-xs py-2.5 px-4 flex items-center gap-2"
              >
                <Copy size={14} />
                {copied ? "Copied" : "Copy payload"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
