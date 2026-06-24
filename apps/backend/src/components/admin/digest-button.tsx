"use client";

import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";

export function DigestButton() {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleSend() {
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/digest/send", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setResult(`Sent to ${data.sent} admin${data.sent === 1 ? "" : "s"}`);
      } else {
        setResult(`Error: ${data.error}`);
      }
    } catch (e: any) {
      setResult(`Error: ${e.message}`);
    } finally {
      setSending(false);
      setTimeout(() => setResult(null), 4000);
    }
  }

  return (
    <div className="admin-card">
      <div className="flex items-center gap-3 mb-2">
        <Mail size={16} className="text-gold-400" />
        <h3 className="text-sm font-semibold">Weekly digest</h3>
      </div>
      <p className="text-xs text-ink-400 mb-4">
        Sends the past 7 days of activity to all active admins. Auto-sends every Monday 9 AM UTC.
      </p>
      <button
        onClick={handleSend}
        disabled={sending}
        className="btn-secondary w-full flex items-center justify-center gap-2"
      >
        {sending ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
        {sending ? "Sending..." : "Send digest now"}
      </button>
      {result && (
        <p className="text-xs font-mono text-gold-400 mt-2">{result}</p>
      )}
    </div>
  );
}
