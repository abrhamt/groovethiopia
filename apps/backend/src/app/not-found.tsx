import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="text-center max-w-md">
        <p className="label-mono mb-4">404</p>
        <h1 className="text-7xl font-serif font-semibold mb-6 text-gradient-gold">404</h1>
        <p className="text-ink-300 mb-8 font-serif">Page not found.</p>
        <Link href="/dashboard" className="admin-button inline-block">
          Dashboard
        </Link>
      </div>
    </div>
  );
}