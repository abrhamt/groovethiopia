"use client";

import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  const phone = "+251911234567"; // placeholder
  const message = encodeURIComponent("Hello, I'm interested in learning more about Groovethiopia.");

  return (
    <a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-2xl shadow-green-500/20 transition-all hover:scale-110 active:scale-95"
    >
      <MessageCircle size={24} />
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-gold-500 rounded-full animate-pulse" />
    </a>
  );
}