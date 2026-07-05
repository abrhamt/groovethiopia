"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Calendar, MapPin, Phone, CreditCard, ArrowRight, ShieldCheck,
  User, Mail, Smartphone, Sparkles, QrCode, Copy, Check, Lock,
} from "lucide-react";
import { GoogleAuth } from "@/components/auth/google-auth";
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
  subtitle?: string;
  startsAt?: string;
  venue?: string;
  venueAddress?: string;
  ticketPrice?: number;
  image?: { url: string; altText?: string };
};

type Provider = "telebirr" | "cbebirr" | "boa" | "stripe" | "chapa";

const providerToBackend: Record<Provider, "TELEBIRR" | "CBEBIRR" | "BOA" | "STRIPE" | "CHAPA"> = {
  telebirr: "TELEBIRR",
  cbebirr: "CBEBIRR",
  boa: "BOA",
  stripe: "STRIPE",
  chapa: "CHAPA",
};

const providerDisplay: Record<Provider, { title: string; description: string; tagline: string; icon: any }> = {
  telebirr: {
    title: "Telebirr Mobile Money",
    description: "Scan with the Telebirr app to authorize the payment.",
    tagline: "Ethio Telecom · Local wallet",
    icon: Smartphone,
  },
  cbebirr: {
    title: "CBE Birr Wallet",
    description: "Authorize via push notification or USSD *847#.",
    tagline: "Commercial Bank of Ethiopia · Local wallet",
    icon: Smartphone,
  },
  boa: {
    title: "Bank of Abyssinia Card",
    description: "Secure Visa / Mastercard checkout via BoA.",
    tagline: "Local card rail · HMAC-signed",
    icon: CreditCard,
  },
  stripe: {
    title: "International Card (Stripe)",
    description: "Visa / Mastercard / Amex processed via Stripe.",
    tagline: "International card rail",
    icon: CreditCard,
  },
  chapa: {
    title: "Chapa Demo Checkout",
    description: "Simulate the full payment locally and download your QR.",
    tagline: "Demo · No real charge",
    icon: Sparkles,
  },
};

export function CheckoutClient({ event }: { event: EventItem }) {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || "en";

  const [user, setUser] = useState<PublicUser | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [provider, setProvider] = useState<Provider>("telebirr");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeSessionStatus, setActiveSessionStatus] = useState<string>("PENDING_PAYMENT");
  const [qrPayload, setQrPayload] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ticketPrice = event.ticketPrice || 0;
  const [quantity, setQuantity] = useState(1);
  const subtotal = ticketPrice * quantity;
  const serviceFee = 5.0;
  const total = subtotal + serviceFee;

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  function startPolling(sessionId: string, currentProvider: Provider) {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const status = await api.getCheckoutStatus(sessionId);
        setActiveSessionStatus(status.status);
        if (status.status === "EXPIRED") {
          if (pollRef.current) clearInterval(pollRef.current);
          setError("Checkout session timed out. Please try again.");
          setActiveSessionId(null);
          setSubmitting(false);
          return;
        }
        if (status.status === "TICKET_ISSUED" || status.status === "PAID") {
          if (pollRef.current) clearInterval(pollRef.current);
          const url =
            "/" + locale + "/tickets/success?session_id=" + sessionId +
            "&order=" + sessionId +
            "&provider=" + status.paymentProvider +
            "&checkoutMethod=" + currentProvider;
          router.push(url);
        }
      } catch (e) {
        console.warn("[checkout] poll failed", e);
      }
    }, 3000);
  }

  async function initiateCheckout(p: Provider, u: PublicUser, phone: string) {
    setSubmitting(true);
    setError("");
    try {
      const result = await api.createCheckout({
        eventId: event.id,
        ticketType: "GENERAL",
        quantity,
        paymentProvider: providerToBackend[p],
        publicUserId: u.id,
        customerEmail: u.email,
        customerPhone: phone,
      });
      setActiveSessionId(result.sessionId);
      setExpiresAt(result.expiresAt);
      if (result.mode === "redirect" && result.url) {
        window.location.href = result.url;
        return;
      }
      if (result.mode === "qr" && result.qrPayload) {
        setQrPayload(result.qrPayload);
      }
      startPolling(result.sessionId, p);
    } catch (e: any) {
      setError(e.message || "Could not initiate checkout.");
      setSubmitting(false);
    }
  }

  function handleGoogleSuccess(u: any) {
    setUser(u);
  }

  function handleGuestSubmit(): PublicUser | null {
    if (!guestName || !guestEmail) {
      setError("Please provide both name and email.");
      return null;
    }
    setError("");
    const mock: PublicUser = {
      id: "guest-" + Date.now(),
      name: guestName,
      email: guestEmail,
    };
    setUser(mock);
    return mock;
  }

  const canPay = !!user && phoneNumber.length >= 7;

  return (
    <div className="min-h-screen bg-background text-foreground py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <Link
          href={"/" + locale + "/events/" + event.slug}
          className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-ink-400 hover:text-gold-400 uppercase transition-colors mb-8"
        >
          &larr; Back to Event Details
        </Link>

        <h1 className="editorial-heading text-4xl md:text-5xl mb-2">Checkout</h1>
        <p className="text-sm text-ink-400 mb-10">
          Choose how you&apos;d like to pay. All five methods sign the same offline gate pass.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-950/20 border border-red-800/40 text-red-400 rounded-xl text-sm">
            <span className="font-semibold font-mono">Error: </span>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 space-y-6">
            <section>
              <h2 className="label-mono mb-3 uppercase tracking-widest text-xs text-gold-400">
                01 &middot; Payment Method
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(Object.keys(providerDisplay) as Provider[]).map((p) => {
                  const Icon = providerDisplay[p].icon;
                  const active = provider === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setProvider(p)}
                      className={
                        "text-left p-4 rounded-2xl border transition-all flex gap-3 items-start " +
                        (active
                          ? "bg-gold-500/5 border-gold-500/80 shadow-[0_0_15px_rgba(212,149,32,0.1)]"
                          : "bg-ink-950/40 border-ink-800/80 hover:border-ink-700")
                      }
                    >
                      <div
                        className={
                          "p-2 rounded-xl " +
                          (active ? "bg-gold-500/20 text-gold-400" : "bg-ink-900 text-ink-400")
                        }
                      >
                        <Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-serif text-base text-white font-semibold">
                            {providerDisplay[p].title}
                          </span>
                          {active && <span className="w-2 h-2 rounded-full bg-gold-400" />}
                        </div>
                        <p className="text-[11px] text-ink-500 mt-1 font-mono uppercase tracking-wider">
                          {providerDisplay[p].tagline}
                        </p>
                        <p className="text-xs text-ink-400 mt-1.5">
                          {providerDisplay[p].description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="label-mono mb-3 uppercase tracking-widest text-xs text-gold-400">
                02 &middot; Your Details
              </h2>
              <div className="bg-ink-950/20 border border-ink-800/60 rounded-2xl p-6 space-y-5">
                {!user ? (
                  <div className="space-y-4">
                    <div className="p-4 border border-ink-800 bg-ink-950/40 rounded-xl flex flex-col items-center justify-center gap-3">
                      <span className="text-xs font-mono tracking-widest text-ink-500 uppercase">
                        Sign in with Google
                      </span>
                      <GoogleAuth onSuccess={handleGoogleSuccess} />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-ink-800" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-background px-3 text-ink-500 font-mono uppercase tracking-widest">
                          Or Guest Checkout
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="label-mono block mb-2 text-xs">
                          Full Name <span className="text-gold-500">*</span>
                        </label>
                        <div className="relative">
                          <User size={14} className="absolute left-3 top-3.5 text-ink-500" />
                          <input
                            type="text"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            placeholder="E.g. Abel Tesfaye"
                            className="admin-input pl-9"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="label-mono block mb-2 text-xs">
                          Email Address <span className="text-gold-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail size={14} className="absolute left-3 top-3.5 text-ink-500" />
                          <input
                            type="email"
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="admin-input pl-9"
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleGuestSubmit()}
                      className="btn-ghost w-full py-2.5 text-sm"
                    >
                      Continue as Guest
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="label-mono text-[10px] text-ink-500">SIGNED IN AS</span>
                      <p className="font-serif text-white">
                        {user.name} <span className="text-ink-400 text-sm">({user.email})</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUser(null)}
                      className="text-xs text-ink-400 hover:text-gold-400 underline"
                    >
                      Change
                    </button>
                  </div>
                )}

                <div>
                  <label className="label-mono block mb-2 text-xs">
                    Phone Number <span className="text-gold-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-3.5 text-ink-500" />
                    <input
                      type="tel"
                      required
                      minLength={7}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+251 912 345 678"
                      className="admin-input pl-9"
                    />
                  </div>
                  <p className="text-xs text-ink-500 mt-2">
                    Required for ticket verification at the gate.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="label-mono mb-3 uppercase tracking-widest text-xs text-gold-400">
                03 &middot; Confirm Payment
              </h2>
              {activeSessionId ? (
                <QrStatusPanel
                  provider={provider}
                  qrPayload={qrPayload}
                  sessionStatus={activeSessionStatus}
                  expiresAt={expiresAt}
                />
              ) : (
                <button
                  type="button"
                  disabled={!canPay || submitting}
                  onClick={() => {
                    let u = user;
                    if (!u) {
                      const guest = handleGuestSubmit();
                      if (!guest) return;
                      u = guest;
                    }
                    initiateCheckout(provider, u, phoneNumber);
                  }}
                  className="btn-primary w-full py-4 text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Lock size={14} />
                  {submitting
                    ? "Initializing secure session..."
                    : "Pay $" +
                      total.toFixed(2) +
                      " with " +
                      providerDisplay[provider].title}
                  <ArrowRight size={14} />
                </button>
              )}

              {activeSessionId && provider === "chapa" && (
                <button
                  type="button"
                  className="btn-ghost w-full mt-3 py-3 text-sm flex items-center justify-center gap-2"
                  onClick={async () => {
                    try {
                      await api.confirmSimulatedCheckout(activeSessionId);
                    } catch (e: any) {
                      setError(e.message || "Could not confirm.");
                    }
                  }}
                >
                  <Check size={14} /> I have completed the demo payment
                </button>
              )}
            </section>
          </div>

          <aside className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="backdrop-blur-md bg-ink-950/40 border border-ink-800/80 p-6 md:p-8 rounded-3xl space-y-6">
              <div className="flex gap-4 border-b border-ink-800 pb-6">
                {event.image && (
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-ink-800 bg-ink-950">
                    <img
                      src={event.image.url}
                      alt={event.image.altText || event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-gold-400 uppercase">
                    Selected Event
                  </span>
                  <h3 className="font-serif text-lg leading-snug text-foreground mt-1 mb-1">
                    {event.title}
                  </h3>
                  <div className="text-xs text-ink-400 space-y-0.5 font-sans">
                    {event.startsAt && (
                      <p className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-gold-400" />{" "}
                        {formatDate(event.startsAt, locale)}
                      </p>
                    )}
                    {event.venue && (
                      <p className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-gold-400" /> {event.venue}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="label-mono block mb-2 text-xs">Quantity</label>
                <div className="flex items-center gap-4 bg-ink-950/80 border border-ink-800 p-2.5 rounded-xl justify-between">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg bg-ink-900 hover:bg-ink-800 text-gold-400 flex items-center justify-center font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="font-mono text-sm font-semibold">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="w-8 h-8 rounded-lg bg-ink-900 hover:bg-ink-800 text-gold-400 flex items-center justify-center font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
                <p className="text-[10px] text-ink-500 mt-1.5 font-mono text-right">
                  Max 10 tickets per transaction
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-400">
                    General Ticket ({quantity} &times; ${ticketPrice})
                  </span>
                  <span className="font-mono">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-400">Convenience &amp; Service Fee</span>
                  <span className="font-mono">${serviceFee.toFixed(2)}</span>
                </div>
                <div className="h-[1px] bg-ink-800 my-2" />
                <div className="flex justify-between items-baseline pt-2">
                  <span className="font-serif text-lg text-gold-400">Total</span>
                  <span className="font-serif text-2xl font-bold text-gradient-gold">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-ink-800 flex items-center gap-2 text-[10px] text-ink-500 font-mono uppercase tracking-wider">
                <ShieldCheck size={14} className="text-gold-400" />
                <span>Offline-signed gate pass on completion</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function QrStatusPanel({
  provider,
  qrPayload,
  sessionStatus,
  expiresAt,
}: {
  provider: Provider;
  qrPayload: string | null;
  sessionStatus: string;
  expiresAt: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const isQr = provider === "telebirr" || provider === "cbebirr";
  return (
    <div className="bg-ink-950/20 border border-ink-800/60 rounded-2xl p-6 space-y-5">
      <div>
        <h3 className="font-serif text-xl text-white flex items-center gap-2">
          <QrCode size={18} className="text-gold-400" />
          {isQr
            ? "Scan with your " + provider + " wallet"
            : "Awaiting confirmation"}
        </h3>
        <p className="text-xs text-ink-400 mt-1">
          Status: <span className="text-gold-400 font-mono">{sessionStatus}</span>
          {expiresAt && (
            <span className="ml-3 text-ink-500 font-mono">
              Expires {new Date(expiresAt).toLocaleTimeString()}
            </span>
          )}
        </p>
      </div>

      {isQr && qrPayload && (
        <div className="space-y-3">
          <div className="p-4 bg-ink-950 rounded-xl border border-ink-800 font-mono text-[10px] break-all text-ink-300 max-h-40 overflow-y-auto">
            {qrPayload}
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(qrPayload);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-ink-800 hover:border-gold-500/40 hover:bg-gold-500/5 text-xs font-mono text-ink-300"
          >
            {copied ? (
              <Check size={14} className="text-gold-400" />
            ) : (
              <Copy size={14} className="text-gold-400" />
            )}
            {copied ? "Copied" : "Copy QR string"}
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 p-3 rounded-xl border border-gold-500/20 bg-gold-500/5 text-xs font-mono text-gold-400">
        <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-ping" />
        <span>Polling the checkout state machine every 3 seconds.</span>
      </div>
    </div>
  );
}
