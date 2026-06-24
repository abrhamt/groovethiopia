"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = "form" | "otp" | "done";

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Registration failed");
      return;
    }

    setStep("otp");
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: otp, purpose: "REGISTRATION" }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Invalid or expired OTP");
      return;
    }

    setStep("done");
  }

  if (step === "done") {
    return (
      <div className="admin-card text-center">
        <h3 className="text-lg font-semibold mb-3 text-gold-400">Verification complete</h3>
        <p className="text-sm text-ink-300 mb-6">
          Your account is now pending admin approval. You'll receive an email once approved.
        </p>
        <button onClick={() => router.push("/login")} className="admin-button-ghost">
          Back to login
        </button>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleVerifyOtp} className="space-y-5">
        <div className="text-sm text-ink-300 mb-4">
          We've sent a 6-digit code to <strong className="text-foreground">{email}</strong>
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-ink-400 mb-2">
            Verification Code
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="admin-input text-center font-mono text-2xl tracking-widest"
            placeholder="000000"
          />
        </div>
        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            {error}
          </div>
        )}
        <button type="submit" disabled={loading || otp.length !== 6} className="admin-button w-full">
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-ink-400 mb-2">Full name</label>
        <input
          type="text" required minLength={2} value={name}
          onChange={(e) => setName(e.target.value)}
          className="admin-input" placeholder="Your name"
        />
      </div>
      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-ink-400 mb-2">Email</label>
        <input
          type="email" required value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="admin-input" placeholder="you@groovethiopia.com"
        />
      </div>
      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-ink-400 mb-2">Password</label>
        <input
          type="password" required minLength={8} value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="admin-input" placeholder="At least 8 characters"
        />
      </div>
      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          {error}
        </div>
      )}
      <button type="submit" disabled={loading} className="admin-button w-full">
        {loading ? "Sending code..." : "Continue"}
      </button>
      <p className="text-xs text-ink-400 text-center">
        Already have an account?{" "}
        <a href="/login" className="text-gold-400 hover:text-gold-300">Sign in</a>
      </p>
    </form>
  );
}