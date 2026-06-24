"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const callbackUrl = search.get("callbackUrl") || "/dashboard";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password, or your account is pending approval.");
      setLoading(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-xs font-mono uppercase tracking-widest text-ink-400 mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="admin-input"
          placeholder="admin@groovethiopia.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-xs font-mono uppercase tracking-widest text-ink-400 mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="admin-input"
        />
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="admin-button w-full">
        {loading ? "Signing in..." : "Sign In"}
      </button>

      <div className="flex items-center justify-between text-xs text-ink-400 pt-2">
        <a href="/forgot-password" className="hover:text-gold-400 transition-colors">
          Forgot password?
        </a>
        <a href="/register" className="hover:text-gold-400 transition-colors">
          Request access
        </a>
      </div>
    </form>
  );
}