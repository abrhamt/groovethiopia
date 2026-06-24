"use client";

import { useEffect, useRef } from "react";
import { api } from "@/lib/api";

declare global {
  interface Window {
    google?: any;
  }
}

export function GoogleAuth({ onSuccess }: { onSuccess: (user: any) => void }) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !buttonRef.current) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          try {
            // Decode JWT for credential
            const credential = response.credential;
            const result = await api.googleOAuth(credential, window.location.origin);
            if (result.success) onSuccess(result.user);
          } catch (e) {
            console.error("Google auth failed", e);
          }
        },
      });
      window.google?.accounts.id.renderButton(buttonRef.current, {
        theme: "filled_black",
        size: "large",
        width: 320,
        text: "signin_with",
        shape: "pill",
      });
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [clientId, onSuccess]);

  if (!clientId) {
    return (
      <div className="text-sm text-ink-400 p-4 border border-ink-800 rounded-lg">
        Google OAuth not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID.
      </div>
    );
  }

  return <div ref={buttonRef} className="flex justify-center" />;
}