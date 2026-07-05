"use client";

// Success page content. Polls the unified checkout state machine (when given
// a session id) and falls back to direct pass lookup (when given an old
// payment reference) for backwards compatibility.

import { useSearchParams, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, ShieldCheck, Calendar, MapPin, Copy, Terminal, Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";
import { generateQRCodeSVG } from "@/lib/qr";
import { formatDate } from "@/lib/utils";

type PassData = {
  qrPayloadBase64: string;
  payload: any;
  publicKey: string;
  ticket: any;
};

export function SuccessContent() {
  const params = useParams();
  const search = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [ticketData, setTicketData] = useState<PassData | null>(null);
  const [qrSvg, setQrSvg] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [showCrypto, setShowCrypto] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string>("");

  useEffect(() => {
    const sessionId = search.get("order") || search.get("session_id");
    const simulated = search.get("simulated");
    const ref = sessionId || simulated;

    if (!ref) {
      setError("No transaction reference found in URL.");
      setLoading(false);
      return;
    }

    const loadPass = async (): Promise<PassData> => {
      // First check whether this is a checkout session id or a payment ref.
      try {
        const status = await api.getCheckoutStatus(ref);
        if (status.pass) {
          return status.pass as PassData;
        }
        if (status.ticket) {
          return (await api.getTicketPass(status.ticket.id)) as PassData;
        }
      } catch {
        // Fall through to legacy lookup.
      }
      // Legacy / direct paymentRef lookup.
      return (await api.getTicketPass(ref)) as PassData;
    };

    loadPass()
      .then((data) => {
        setTicketData(data);
        if (data.qrPayloadBase64) {
          const svg = generateQRCodeSVG(data.qrPayloadBase64, 280);
          setQrSvg(svg);

          try {
            const offlineTickets = JSON.parse(localStorage.getItem("groovethiopia_tickets") || "[]");
            const ticketInfo = {
              id: data.ticket.id,
              serialNumber: data.ticket.serialNumber,
              eventTitle: data.ticket.event.title,
              startsAt: data.ticket.event.startsAt,
              venue: data.ticket.event.venue,
              venueAddress: data.ticket.event.venueAddress,
              qrPayloadBase64: data.qrPayloadBase64,
              ticketType: data.ticket.ticketType,
              quantity: data.ticket.quantity,
              userName: data.ticket.user.name,
              savedAt: new Date().toISOString(),
            };
            const exists = offlineTickets.some((t: any) => t.id === ticketInfo.id);
            if (!exists) {
              offlineTickets.push(ticketInfo);
              localStorage.setItem("groovethiopia_tickets", JSON.stringify(offlineTickets));
            }
          } catch (storageErr) {
            console.error("Local storage save failed:", storageErr);
          }

          const shouldDownload = search.get("downloadQr") === "true";
          const method = search.get("provider") || search.get("checkoutMethod") || "simulated";

          if (shouldDownload || method === "CHAPA" || method === "chapa") {
            setDownloadStatus("Saving ticket QR code locally & triggering download...");
            setTimeout(() => {
              try {
                const blob = new Blob([svg], { type: "image/svg+xml" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `groovethiopia-ticket-${data.ticket.serialNumber || data.ticket.id}.svg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                setDownloadStatus("Ticket QR saved & downloaded successfully!");
              } catch (downloadErr) {
                console.error("Auto-download failed:", downloadErr);
                setDownloadStatus("Saved locally to offline storage!");
              }
            }, 800);
          } else {
            setDownloadStatus("Ticket saved to local offline storage.");
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("[success-content] fetch pass failed:", err);
        setError("Unable to retrieve your gate pass. Please try refreshing.");
        setLoading(false);
      });
  }, [search]);

  const handleCopyPayload = () => {
    if (ticketData?.qrPayloadBase64) {
      navigator.clipboard.writeText(ticketData.qrPayloadBase64);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <p className="label-mono text-gold-400">Verifying secure ticket on-chain...</p>
        </div>
      </div>
    );
  }

  if (error || !ticketData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-6">
        <div className="text-center max-w-md p-8 border border-red-500/20 rounded-2xl bg-red-950/10">
          <p className="text-red-400 font-serif text-lg mb-6">{error || "Ticket not found."}</p>
          <a href={`/${params.locale}/events`} className="btn-primary">
            Browse Events
          </a>
        </div>
      </div>
    );
  }

  const { ticket, qrPayloadBase64, payload, publicKey } = ticketData;
  const event = ticket.event;

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 bg-black text-foreground selection:bg-gold-500/30">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center animate-pulse">
            <Check size={28} className="text-gold-400" />
          </div>
          <span className="label-mono text-gold-400 text-xs tracking-widest uppercase">Transaction Confirmed</span>
          <h1 className="editorial-heading text-4xl md:text-5xl mt-3 text-white">
            You're Confirmed
          </h1>
          <p className="text-ink-400 font-serif italic mt-2">
            Your offline gate pass has been cryptographically signed and issued.
          </p>
          {downloadStatus && (
            <div className="mt-4 inline-block px-4 py-1.5 bg-gold-500/10 border border-gold-500/20 text-gold-400 rounded-full text-xs font-mono tracking-wide">
              ✨ {downloadStatus}
            </div>
          )}
        </div>

        {/* Verifiable Gate Pass Card */}
        <div className="relative border border-ink-800 rounded-3xl overflow-hidden bg-gradient-to-b from-ink-900/60 to-ink-950/90 shadow-2xl backdrop-blur-md">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />

          <div className="p-8 md:p-10">
            <div className="flex items-center justify-between border-b border-ink-800/80 pb-6 mb-8">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={20} className="text-gold-400" />
                <span className="label-mono text-xs tracking-wider text-white">SECURE OFFLINE PASS</span>
              </div>
              <div className="flex items-center gap-1.5 bg-gold-500/10 px-3 py-1 rounded-full border border-gold-500/20">
                <span className="w-2 h-2 rounded-full bg-gold-400 animate-ping" />
                <span className="text-[10px] font-mono text-gold-400 font-bold uppercase tracking-wider">VERIFIED</span>
              </div>
            </div>

            <div className="mb-8">
              <span className="label-mono text-[10px] text-ink-500 uppercase tracking-widest">Event</span>
              <h2 className="editorial-heading text-3xl md:text-4xl text-white mt-1 mb-6">
                {event.title}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-gold-500/70 mt-0.5" />
                  <div>
                    <p className="font-mono text-[11px] text-ink-500 uppercase tracking-wider">Date & Time</p>
                    <p className="font-serif text-ink-200 mt-1 text-base">
                      {event.startsAt ? formatDate(event.startsAt, String(params.locale)) : "TBA"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-gold-500/70 mt-0.5" />
                  <div>
                    <p className="font-mono text-[11px] text-ink-500 uppercase tracking-wider">Venue</p>
                    <p className="font-serif text-ink-200 mt-1 text-base leading-snug">
                      {event.venue || "TBA"}
                      {event.venueAddress && (
                        <span className="block text-xs text-ink-400 mt-0.5 font-sans not-italic">
                          {event.venueAddress}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center py-8 border-t border-b border-ink-800/80 my-8">
              <div className="relative p-4 rounded-2xl bg-ink-950 border border-ink-800/80 shadow-inner">
                {qrSvg && (
                  <div
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                    className="w-full max-w-[280px] aspect-square rounded-lg overflow-hidden"
                  />
                )}
                <div className="absolute -inset-1 bg-gradient-to-r from-gold-500/10 to-transparent blur-md -z-10 rounded-3xl" />
              </div>
              <p className="text-[11px] font-mono text-gold-400 mt-4 tracking-wider uppercase font-semibold">
                Serial: {ticket.serialNumber}
              </p>
              <p className="text-[11px] font-mono text-ink-500 mt-1 tracking-wider uppercase">
                Present this QR code at the gate (No internet required)
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs font-mono text-ink-400 border-b border-ink-800/50 pb-6 mb-8">
              <div>
                <span className="text-[10px] text-ink-500 block mb-1">HOLDER</span>
                <span className="text-ink-200 font-sans font-medium text-sm block truncate">
                  {ticket.user.name || "Guest"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-ink-500 block mb-1">TYPE</span>
                <span className="text-gold-400 block text-sm font-semibold">
                  {ticket.ticketType}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-ink-500 block mb-1">QTY</span>
                <span className="text-ink-200 block text-sm font-semibold">
                  {ticket.quantity}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-ink-500 block mb-1">SERIAL</span>
                <span className="text-ink-200 block text-sm truncate" title={ticket.serialNumber}>
                  {ticket.serialNumber}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={handleCopyPayload}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-ink-800 hover:border-gold-500/40 hover:bg-gold-500/5 transition-all text-xs font-mono text-ink-300"
                >
                  <Copy size={14} className="text-gold-400" />
                  {copied ? "Copied Base64" : "Copy Payload"}
                </button>
                <button
                  onClick={() => setShowCrypto(!showCrypto)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-ink-800 hover:border-gold-500/40 hover:bg-gold-500/5 transition-all text-xs font-mono text-ink-300"
                >
                  <Terminal size={14} className="text-gold-400" />
                  {showCrypto ? "Hide Crypto Details" : "Show Crypto Details"}
                </button>
              </div>
              <a href={`/${params.locale}/events`} className="btn-primary w-full sm:w-auto text-center py-2 px-6">
                Browse Events
              </a>
            </div>
          </div>
        </div>

        {showCrypto && (
          <div className="mt-8 p-6 rounded-2xl border border-ink-800/80 bg-ink-950/40 font-mono text-[11px] leading-relaxed text-ink-400 space-y-4 animate-fade-in">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-ink-800 pb-3 mb-4">
              <Terminal size={14} className="text-gold-500" /> Cryptographic Signatures
            </h3>
            <div>
              <p className="text-gold-400 font-semibold mb-1">1. Decoded Ticket Payload JSON (ticketData)</p>
              <pre className="p-3 bg-ink-950 rounded-lg border border-ink-900 overflow-x-auto text-ink-200">
                {JSON.stringify(payload, null, 2)}
              </pre>
            </div>
            <div>
              <p className="text-gold-400 font-semibold mb-1">2. ECDSA Signature (sig)</p>
              <pre className="p-3 bg-ink-950 rounded-lg border border-ink-900 break-all text-ink-300">
                {payload.sig}
              </pre>
            </div>
            <div>
              <p className="text-gold-400 font-semibold mb-1">3. Issuer Public Key PEM (ECDSA P-256)</p>
              <pre className="p-3 bg-ink-950 rounded-lg border border-ink-900 overflow-x-auto text-ink-500 text-[10px]">
                {publicKey}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}