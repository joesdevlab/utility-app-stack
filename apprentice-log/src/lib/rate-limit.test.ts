import { describe, it, expect, beforeEach } from "vitest";
import {
  createRateLimiter,
  checkTypedRateLimit,
  getClientIp,
} from "./rate-limit";

describe("createRateLimiter", () => {
  it("allows requests within the limit", () => {
    const limiter = createRateLimiter({
      interval: 60_000,
      limit: 3,
      name: "test-allow",
    });

    const r1 = limiter.check("user1");
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = limiter.check("user1");
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = limiter.check("user1");
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it("blocks requests over the limit", () => {
    const limiter = createRateLimiter({
      interval: 60_000,
      limit: 2,
      name: "test-block",
    });

    limiter.check("user2");
    limiter.check("user2");

    const r3 = limiter.check("user2");
    expect(r3.allowed).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it("tracks different identifiers separately", () => {
    const limiter = createRateLimiter({
      interval: 60_000,
      limit: 1,
      name: "test-separate",
    });

    const r1 = limiter.check("userA");
    expect(r1.allowed).toBe(true);

    const r2 = limiter.check("userB");
    expect(r2.allowed).toBe(true);

    // userA should be blocked now
    const r3 = limiter.check("userA");
    expect(r3.allowed).toBe(false);
  });

  it("returns reset timestamp in the future", () => {
    const limiter = createRateLimiter({
      interval: 60_000,
      limit: 5,
      name: "test-reset",
    });

    const result = limiter.check("user3");
    expect(result.reset).toBeGreaterThan(Date.now());
    expect(result.reset).toBeLessThanOrEqual(Date.now() + 60_000);
  });
});

describe("checkTypedRateLimit", () => {
  it("uses the correct limiter for each type", () => {
    // AI limiter: 20/min
    const aiResult = checkTypedRateLimit("test-user-typed", "ai");
    expect(aiResult.allowed).toBe(true);
    expect(aiResult.limit).toBe(20);

    // Password reset: 3/hour
    const pwResult = checkTypedRateLimit("test-user-typed-pw", "password-reset");
    expect(pwResult.allowed).toBe(true);
    expect(pwResult.limit).toBe(3);
  });
});

describe("getClientIp", () => {
  it("returns cf-connecting-ip when present", () => {
    const headers = new Headers({
      "cf-connecting-ip": "1.2.3.4",
      "x-real-ip": "5.6.7.8",
    });
    expect(getClientIp(headers)).toBe("1.2.3.4");
  });

  it("returns x-real-ip as fallback", () => {
    const headers = new Headers({
      "x-real-ip": "5.6.7.8",
    });
    expect(getClientIp(headers)).toBe("5.6.7.8");
  });

  it("returns first x-forwarded-for IP", () => {
    const headers = new Headers({
      "x-forwarded-for": "10.0.0.1, 10.0.0.2, 10.0.0.3",
    });
    expect(getClientIp(headers)).toBe("10.0.0.1");
  });

  it("returns 'unknown' when no IP headers present", () => {
    const headers = new Headers();
    expect(getClientIp(headers)).toBe("unknown");
  });
});
