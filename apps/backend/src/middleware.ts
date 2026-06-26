// CORS + security headers + basic rate limiting for backend API
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000",
  process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001",
  "http://localhost:3000",
  "http://localhost:3001",
  "https://groovethiopia.com",
  "https://www.groovethiopia.com",
  "https://admin.groovethiopia.com",
];

// Simple in-memory rate limit: 60 requests per minute per IP for /api/public/*
// and 20 requests per minute per IP for write endpoints
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of rateLimitMap.entries()) {
    if (v.resetAt < now) rateLimitMap.delete(k);
  }
}, 60000).unref?.();

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply to API routes
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const origin = request.headers.get("origin");
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";

  // Rate limit public POST endpoints (booking, ticket checkout, inquiry, contact)
  if (request.method !== "GET" && request.method !== "OPTIONS" && pathname.startsWith("/api/public/")) {
    const limited = !rateLimit(`post:${ip}:${pathname}`, 20, 60000);
    if (limited) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests. Please try again in a minute." }),
        { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60" } }
      );
    }
  }

  // Rate limit public GET endpoints (more lenient)
  if (request.method === "GET" && pathname.startsWith("/api/public/")) {
    const limited = !rateLimit(`get:${ip}`, 200, 60000);
    if (limited) {
      return new NextResponse(
        JSON.stringify({ error: "Rate limit exceeded." }),
        { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60" } }
      );
    }
  }

  // Handle preflight (CORS)
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Recaptcha-Token");
      response.headers.set("Access-Control-Max-Age", "86400");
    }
    return response;
  }

  const response = NextResponse.next();

  // CORS
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Vary", "Origin");
  }

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // HSTS (only enable in production)
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
