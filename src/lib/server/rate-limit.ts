import { NextResponse } from "next/server";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export type RateLimitConfig = {
  key: string;
  limit: number;
  windowMs: number;
};

export function getRateLimitKey(request: Request, scope: string) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() ?? "unknown";
  return `${scope}:${ip}`;
}

export function createRateLimitResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests. Please retry later.",
      },
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
      },
    },
  );
}

export function checkRateLimit(config: RateLimitConfig) {
  const now = Date.now();
  const existing = buckets.get(config.key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(config.key, { count: 1, resetAt: now + config.windowMs });
    return { ok: true as const };
  }

  if (existing.count >= config.limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return { ok: false as const, retryAfterSeconds };
  }

  existing.count += 1;
  return { ok: true as const };
}
