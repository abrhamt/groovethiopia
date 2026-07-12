"use client";

import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";

const COOKIE_KEY = "groovethiopia-cookie-consent";

export function WhatsAppButton() {
  const [visible, setVisible] = useState(false);
  const phone = "+251911234567"; // placeholder
  const message = encodeURIComponent("Hello, I'm interested in learning more about Groovethiopia.");

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (consent) {
      setVisible(true);
    } else {
      const interval = setInterval(() => {
        const consentNow = localStorage.getItem(COOKIE_KEY);
        if (consentNow) {
          setVisible(true);
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, []);

  if (!visible) return null;

  return (
    <a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 left-6 md:left-auto md:right-6 z-50 w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-2xl shadow-green-500/20 transition-all hover:scale-110 active:scale-95"
    >
      <MessageCircle size={24} />
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-gold-500 rounded-full animate-pulse" />
    </a>
  );
}