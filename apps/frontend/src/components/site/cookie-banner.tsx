"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocalePath } from "@/lib/locale-path-client";

const COOKIE_KEY = "groovethiopia-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const lpath = useLocalePath();

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      // Slight delay so it doesn't flash on initial load
      setTimeout(() => setVisible(true), 1500);
    }
  }, []);

  function accept() {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(COOKIE_KEY, "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 left-4 right-4 sm:left-6 sm:right-6 md:right-auto md:max-w-md z-40">
      <div className="glass rounded-2xl p-6 shadow-2xl">
        <p className="text-sm text-ink-200 mb-4 font-serif">
          We use cookies to enhance your experience and analyze site traffic. By continuing, you agree to our use of cookies.
        </p>
        <div className="flex items-center gap-2 mb-3">
          <button onClick={accept} className="admin-button flex-1 text-xs px-4 py-2">
            Accept
          </button>
          <button onClick={decline} className="admin-button-ghost text-xs px-4 py-2">
            Decline
          </button>
        </div>
        <Link href={lpath("/legal/cookies")} className="text-xs text-ink-400 hover:text-gold-400">
          Cookie Policy →
        </Link>
      </div>
    </div>
  );
}