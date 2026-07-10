"use client";

// Minimalist Chapa (simulation) checkout. One provider, one button, no clutter.
// Flow:
//   1. collect name / email / phone + quantity
//   2. tap "Pay with Chapa (Demo)" → server creates the checkout session
//   3. tap "Confirm demo payment" → server flips the session to PAID and
//      issues one TicketPurchase per ticket in the order
//   4. poll status → when TICKET_ISSUED, send the user to /success

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Calendar, MapPin, Phone, Mail, User, ArrowRight, Sparkles,
  Lock, Minus, Plus, ShieldCheck, Loader2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { api } from "@/lib/api";

type PublicUser = {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string | null;
};

type EventItem = {
  id: string;
  slug: string;
  title: string;
  startsAt?: string;
  venue?: string;
  venueAddress?: string;
  ticketPrice?: number;
  image?: { url: string; altText?: string };
};

type Phase = "form" | "awaiting-session" | "awaiting-payment" | "issuing";

export function CheckoutClient({ event }: { event: EventItem }) {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || "en";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<Phase>("form");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ticketPrice = event.ticketPrice || 0;
  const subtotal = ticketPrice * quantity;
  const serviceFee: number = 0; // waived in the demo
  const total = subtotal + serviceFee;

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  function validate(): string | null {
    if (name.trim().length < 2) return "Please enter your full name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "Please enter a valid email.";
    if (phone.trim().length < 7) return "Please enter a valid phone number.";
    if (quantity < 1 || quantity > 10) return "Quantity must be between 1 and 10.";
    return null;
  }

  async function startCheckout() {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    setError("");
    setPhase("awaiting-session");
    try {
      const result = await api.createCheckout({
        eventId: event.id,
        ticketType: "GENERAL",
        quantity,
        paymentProvider: "CHAPA",
        customerEmail: email,
        customerPhone: phone,
      });
      setSessionId(result.sessionId);
      setPhase("awaiting-payment");
    } catch (e: any) {
      setError(e.message || "Could not start checkout.");
      setPhase("form");
    }
  }

  async function confirmPayment() {
    if (!sessionId) return;
    setPhase("issuing");
    setError("");
    try {
      await api.confirmSimulatedCheckout(sessionId);
      startPolling(sessionId);
    } catch (e: any) {
      setError(e.message || "Could not confirm payment.");
      setPhase("awaiting-payment");
    }
  }

  function startPolling(id: string) {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const status = await api.getCheckoutStatus(id);
        if (status.status === "TICKET_ISSUED") {
          if (pollRef.current) clearInterval(pollRef.current);
          router.push(
            "/" + locale + "/tickets/success?session_id=" + id + "&order=" + id
          );
        } else if (status.status === "EXPIRED" || status.status === "FAILED") {
          if (pollRef.current) clearInterval(pollRef.current);
          setError("This checkout session expired. Please try again.");
          setPhase("form");
          setSessionId(null);
        }
      } catch (e) {
        console.warn("[checkout] poll failed", e);
      }
    }, 2000);
  }

  const busy = phase !== "form";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <Link
          href={"/" + locale + "/events/" + event.slug}
          className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest text-ink-400 hover:text-gold-400 uppercase transition-colors mb-10"
        >
          &larr; Back to event
        </Link>

        <div className="text-center mb-10">
          <span className="label-mono">Checkout · Simulation</span>
          <h1 className="editorial-heading text-3xl md:text-4xl mt-2 text-white">
            Reserve your <span className="text-gradient-gold italic">gate pass</span>
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-950/20 border border-red-800/40 text-red-300 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Event card */}
        <div className="card p-5 flex items-start gap-4 mb-6">
          {event.image?.url ? (
            <img
              src={event.image.url}
              alt={event.image.altText || event.title}
              className="w-16 h-16 rounded-xl object-cover border border-ink-800"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-ink-800 border border-ink-700 flex items-center justify-center">
              <Sparkles size={18} className="text-gold-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="font-serif text-lg text-white truncate">{event.title}</h2>
            <div className="text-xs text-ink-400 mt-1 space-y-0.5">
              {event.startsAt && (
                <p className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-gold-400" />
                  {formatDate(event.startsAt, locale)}
                </p>
              )}
              {event.venue && (
                <p className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-gold-400" />
                  {event.venue}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="card p-6 space-y-5">
          <Field icon={<User size={14} />} label="Full name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Abel Tesfaye"
              className="w-full bg-transparent outline-none text-sm placeholder:text-ink-500"
              disabled={busy}
            />
          </Field>
          <Field icon={<Mail size={14} />} label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-transparent outline-none text-sm placeholder:text-ink-500"
              disabled={busy}
            />
          </Field>
          <Field icon={<Phone size={14} />} label="Phone (used at gate)">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+251 912 345 678"
              className="w-full bg-transparent outline-none text-sm placeholder:text-ink-500"
              disabled={busy}
            />
          </Field>

          {/* Quantity */}
          <div>
            <label className="label-mono block mb-2">Tickets</label>
            <div className="flex items-center justify-between bg-ink-950 border border-ink-800 rounded-xl px-2 py-1.5">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={busy || quantity <= 1}
                className="w-9 h-9 rounded-lg bg-ink-900 hover:bg-ink-800 disabled:opacity-40 text-gold-400 flex items-center justify-center transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="font-mono text-sm">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                disabled={busy || quantity >= 10}
                className="w-9 h-9 rounded-lg bg-ink-900 hover:bg-ink-800 disabled:opacity-40 text-gold-400 flex items-center justify-center transition-colors"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
            <p className="text-[10px] text-ink-500 mt-1.5 font-mono">
              Each ticket gets its own QR code.
            </p>
          </div>

          {/* Order summary */}
          <div className="pt-4 mt-2 border-t border-ink-800 space-y-2">
            <Row label={`Ticket × ${quantity}`} value={`$${subtotal.toFixed(2)}`} />
            <Row label="Service fee" value={serviceFee === 0 ? "Free" : `$${serviceFee.toFixed(2)}`} />
            <div className="h-px bg-ink-800 my-2" />
            <div className="flex items-baseline justify-between">
              <span className="font-serif text-lg text-gold-400">Total</span>
              <span className="font-serif text-2xl font-bold text-gradient-gold">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="mt-6 space-y-3">
          {phase === "form" && (
            <button
              type="button"
              onClick={startCheckout}
              className="btn-primary w-full py-4 text-sm flex items-center justify-center gap-2"
            >
              <Lock size={14} />
              Continue with Chapa (Demo)
              <ArrowRight size={14} />
            </button>
          )}

          {phase === "awaiting-session" && (
            <button disabled className="btn-primary w-full py-4 text-sm flex items-center justify-center gap-2 opacity-70">
              <Loader2 size={14} className="animate-spin" />
              Securing your session…
            </button>
          )}

          {phase === "awaiting-payment" && (
            <button
              type="button"
              onClick={confirmPayment}
              className="btn-primary w-full py-4 text-sm flex items-center justify-center gap-2"
            >
              <Sparkles size={14} />
              Confirm demo payment
              <ArrowRight size={14} />
            </button>
          )}

          {phase === "issuing" && (
            <button disabled className="btn-primary w-full py-4 text-sm flex items-center justify-center gap-2 opacity-70">
              <Loader2 size={14} className="animate-spin" />
              Issuing your QR gate pass…
            </button>
          )}

          <div className="flex items-center justify-center gap-2 text-[10px] text-ink-500 font-mono uppercase tracking-wider">
            <ShieldCheck size={12} className="text-gold-400" />
            Demo · No real charge · Signed gate pass
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label-mono block mb-1.5">{label}</span>
      <div className="flex items-center gap-2 bg-ink-950 border border-ink-800 rounded-xl px-3 py-2.5 focus-within:border-gold-500/60 transition-colors">
        <span className="text-ink-500">{icon}</span>
        {children}
      </div>
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-ink-400">{label}</span>
      <span className="font-mono text-ink-200">{value}</span>
    </div>
  );
}
