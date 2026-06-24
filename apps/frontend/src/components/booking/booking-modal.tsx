"use client";

import { useState } from "react";
import { X, Calendar, MapPin, Users, Phone } from "lucide-react";
import { GoogleAuth } from "@/components/auth/google-auth";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

type PublicUser = {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string | null;
};

export function BookingButton({
  eventId,
  eventTitle,
  startsAt,
  venue,
  capacity,
  ticketPrice,
}: {
  eventId: string;
  eventTitle: string;
  startsAt: string;
  venue?: string;
  capacity?: number;
  ticketPrice?: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary">
        Request Invitation
      </button>
      {open && (
        <BookingModal
          eventId={eventId}
          eventTitle={eventTitle}
          startsAt={startsAt}
          venue={venue}
          capacity={capacity}
          ticketPrice={ticketPrice}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function BookingModal({
  eventId,
  eventTitle,
  startsAt,
  venue,
  capacity,
  ticketPrice,
  onClose,
}: {
  eventId: string;
  eventTitle: string;
  startsAt: string;
  venue?: string;
  capacity?: number;
  ticketPrice?: number;
  onClose: () => void;
}) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [step, setStep] = useState<"auth" | "form" | "success">("auth");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full bg-ink-900 border border-ink-800 rounded-2xl p-8 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ink-400 hover:text-gold-400"
        >
          <X size={20} />
        </button>

        {/* Event summary */}
        <div className="mb-6 pb-6 border-b border-ink-800">
          <span className="label-mono">Reserve</span>
          <h2 className="font-serif text-2xl mt-2 mb-3">{eventTitle}</h2>
          <div className="space-y-1 text-sm text-ink-300">
            {startsAt && (
              <p className="flex items-center gap-2">
                <Calendar size={14} className="text-gold-400" />
                {formatDate(startsAt)}
              </p>
            )}
            {venue && (
              <p className="flex items-center gap-2">
                <MapPin size={14} className="text-gold-400" />
                {venue}
              </p>
            )}
            {capacity && (
              <p className="flex items-center gap-2 text-xs text-ink-400">
                <Users size={14} /> {capacity} capacity
              </p>
            )}
          </div>
          {ticketPrice && ticketPrice > 0 && (
            <p className="mt-4 text-xl text-gradient-gold font-semibold">
              ${ticketPrice.toLocaleString()}
            </p>
          )}
        </div>

        {step === "auth" && (
          <AuthStep
            onSuccess={(u) => {
              setUser(u);
              setStep("form");
            }}
            onClose={onClose}
          />
        )}

        {step === "form" && user && (
          <FormStep
            eventId={eventId}
            user={user}
            ticketPrice={ticketPrice}
            submitting={submitting}
            setSubmitting={setSubmitting}
            error={error}
            setError={setError}
            onSuccess={() => setStep("success")}
          />
        )}

        {step === "success" && (
          <SuccessStep onClose={onClose} eventTitle={eventTitle} />
        )}
      </div>
    </div>
  );
}

function AuthStep({
  onSuccess,
  onClose,
}: {
  onSuccess: (user: PublicUser) => void;
  onClose: () => void;
}) {
  const [mockLoading, setMockLoading] = useState(false);

  // Dev/demo shortcut — when Google OAuth isn't configured
  async function devSignIn() {
    setMockLoading(true);
    try {
      // For demo: create a mock public user
      const mockUser: PublicUser = {
        id: "demo-user-" + Date.now(),
        email: "demo@groovethiopia.com",
        name: "Demo Guest",
        phoneNumber: null,
      };
      onSuccess(mockUser);
    } finally {
      setMockLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-serif text-xl mb-2">Confirm your attendance</h3>
        <p className="text-sm text-ink-300">
          Sign in with Google to reserve your spot. We'll send confirmation details to your inbox.
        </p>
      </div>

      <div className="flex justify-center">
        <GoogleAuth onSuccess={onSuccess} />
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-ink-800" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-ink-900 px-3 text-ink-500 font-mono uppercase tracking-widest">Or</span>
        </div>
      </div>

      <button
        onClick={devSignIn}
        disabled={mockLoading}
        className="admin-button-ghost w-full text-sm"
      >
        {mockLoading ? "..." : "Continue as demo guest (dev only)"}
      </button>

      <p className="text-xs text-ink-500 text-center">
        By signing in you agree to receive event updates from Groovethiopia.
      </p>
    </div>
  );
}

function FormStep({
  eventId,
  user,
  ticketPrice,
  submitting,
  setSubmitting,
  error,
  setError,
  onSuccess,
}: {
  eventId: string;
  user: PublicUser;
  ticketPrice?: number;
  submitting: boolean;
  setSubmitting: (b: boolean) => void;
  error: string;
  setError: (s: string) => void;
  onSuccess: () => void;
}) {
  const [partySize, setPartySize] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "");
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await api.bookEvent({
        eventId,
        publicUserId: user.id,
        partySize,
        phoneNumber,
        notes: notes || undefined,
      });
      onSuccess();
    } catch (e: any) {
      setError(e.message || "Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="font-serif text-xl mb-2">Reservation details</h3>
        <p className="text-sm text-ink-300">Signed in as {user.email}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-mono block mb-2">
            <Users size={12} className="inline mr-1" />
            Party size
          </label>
          <select
            value={partySize}
            onChange={(e) => setPartySize(parseInt(e.target.value))}
            className="admin-input"
            required
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-mono block mb-2">
            <Phone size={12} className="inline mr-1" />
            Phone <span className="text-red-400">*</span>
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            minLength={7}
            className="admin-input"
            placeholder="+251 ..."
          />
        </div>
      </div>

      <div>
        <label className="label-mono block mb-2">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="admin-input"
          placeholder="Dietary requirements, accessibility, etc."
        />
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-2">
        <div className="text-sm text-ink-400">
          {ticketPrice && ticketPrice > 0 && partySize > 0 && (
            <>
              Total:{" "}
              <span className="text-gold-400 font-semibold">
                ${(ticketPrice * partySize).toLocaleString()}
              </span>
            </>
          )}
          {(!ticketPrice || ticketPrice === 0) && (
            <span className="text-gold-400">Complimentary RSVP</span>
          )}
        </div>
        <button
          type="submit"
          disabled={submitting || !phoneNumber}
          className="btn-primary"
        >
          {submitting ? "Reserving..." : "Confirm Reservation"}
        </button>
      </div>
    </form>
  );
}

function SuccessStep({
  onClose,
  eventTitle,
}: {
  onClose: () => void;
  eventTitle: string;
}) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center">
        <span className="text-3xl text-gold-400">✓</span>
      </div>
      <h3 className="font-serif text-2xl mb-3">Reservation confirmed</h3>
      <p className="text-ink-300 mb-6">
        Your spot for <span className="text-gold-400">{eventTitle}</span> is held. Check your email for the invitation with venue details.
      </p>
      <button onClick={onClose} className="btn-primary">
        Done
      </button>
    </div>
  );
}