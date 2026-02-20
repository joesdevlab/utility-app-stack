import { NextResponse } from "next/server";

/**
 * Rate Limiting Utility
 *
 * Uses an in-memory store with automatic cleanup.
 * For production with multiple Vercel instances, consider using Vercel KV or Upstash Redis.
 */

interface RateLimitOptions {
  /** Time window in milliseconds */
  interval: number;
  /** Maximum requests allowed in the interval */
  limit: number;
  /** Unique identifier for this limiter */
  name?: string;
}

interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Remaining requests in the current window */
  remaining: number;
  /** Total limit */
  limit: number;
  /** Timestamp when the rate limit resets (ms since epoch) */
  reset: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
const rateLimitMap = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function startCleanup() {
  if (cleanupInterval) return;
  if (typeof setInterval !== "undefined") {
    cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of rateLimitMap.entries()) {
        if (entry.resetTime < now) {
          rateLimitMap.delete(key);
        }
      }
    }, 5 * 60 * 1000);
  }
}

/**
 * Create a configurable rate limiter
 */
export function createRateLimiter(options: RateLimitOptions) {
  const { interval, limit, name = "default" } = options;

  startCleanup();

  return {
    check(identifier: string): RateLimitResult {
      const key = `${name}:${identifier}`;
      const now = Date.now();
      const entry = rateLimitMap.get(key);

      if (!entry || entry.resetTime < now) {
        rateLimitMap.set(key, {
          count: 1,
          resetTime: now + interval,
        });
        return {
          allowed: true,
          remaining: limit - 1,
          limit,
          reset: now + interval,
        };
      }

      if (entry.count >= limit) {
        return {
          allowed: false,
          remaining: 0,
          limit,
          reset: entry.resetTime,
        };
      }

      entry.count++;
      return {
        allowed: true,
        remaining: limit - entry.count,
        limit,
        reset: entry.resetTime,
      };
    },
  };
}

// Pre-configured rate limiters for different use cases

/** General API: 60 requests per minute */
const generalLimiter = createRateLimiter({
  interval: 60_000,
  limit: 60,
  name: "general",
});

/** Auth sign-in: 5 attempts per minute per IP (brute force protection) */
const signInLimiter = createRateLimiter({
  interval: 60_000,
  limit: 5,
  name: "signin",
});

/** Auth sign-up: 3 attempts per hour per IP (spam prevention) */
const signUpLimiter = createRateLimiter({
  interval: 60 * 60 * 1000,
  limit: 3,
  name: "signup",
});

/** Password reset: 3 requests per hour per IP */
const passwordResetLimiter = createRateLimiter({
  interval: 60 * 60 * 1000,
  limit: 3,
  name: "password-reset",
});

/** AI endpoints (transcribe/format): 20 requests per minute per user */
const aiLimiter = createRateLimiter({
  interval: 60_000,
  limit: 20,
  name: "ai",
});

/** Email sending: 5 emails per hour per user */
const emailLimiter = createRateLimiter({
  interval: 60 * 60 * 1000,
  limit: 5,
  name: "email",
});

// Legacy function for backward compatibility
const RATE_LIMIT = 10;
const WINDOW_MS = 60 * 1000;

export function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const result = generalLimiter.check(userId);
  return { allowed: result.allowed, remaining: result.remaining };
}

// Type-specific rate limit checkers
export type RateLimitType = "signin" | "signup" | "password-reset" | "ai" | "email" | "general";

export function checkTypedRateLimit(
  identifier: string,
  type: RateLimitType
): RateLimitResult {
  switch (type) {
    case "signin":
      return signInLimiter.check(identifier);
    case "signup":
      return signUpLimiter.check(identifier);
    case "password-reset":
      return passwordResetLimiter.check(identifier);
    case "ai":
      return aiLimiter.check(identifier);
    case "email":
      return emailLimiter.check(identifier);
    default:
      return generalLimiter.check(identifier);
  }
}

export function rateLimitResponse(result?: RateLimitResult): NextResponse {
  const retryAfter = result
    ? Math.ceil((result.reset - Date.now()) / 1000)
    : 60;

  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": retryAfter.toString(),
        ...(result && {
          "X-RateLimit-Limit": result.limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": Math.ceil(result.reset / 1000).toString(),
        }),
      },
    }
  );
}

/**
 * Get client IP from request headers
 */
export function getClientIp(headers: Headers): string {
  // Cloudflare
  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp;

  // Vercel
  const xRealIp = headers.get("x-real-ip");
  if (xRealIp) return xRealIp;

  // Standard proxy header
  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }

  return "unknown";
}
