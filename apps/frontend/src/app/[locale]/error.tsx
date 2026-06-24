"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="label-mono mb-4 text-red-400">Error</p>
        <h1 className="editorial-heading text-5xl md:text-7xl mb-6">
          Something broke
        </h1>
        <p className="text-ink-300 mb-8 font-serif">
          We hit an unexpected issue. Try again, or head back to safety.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={reset} className="btn-primary">
            Try again
          </button>
          <Link href="/" className="btn-ghost">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}