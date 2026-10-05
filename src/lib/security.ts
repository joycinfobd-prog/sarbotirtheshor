import { NextRequest } from "next/server";

/* ---------------- rate limiting (in-memory, per instance) ---------------- */

type Bucket = { count: number; reset: number };
const buckets = new Map<string, Bucket>();

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  if (buckets.size > 8000) {
    for (const [k, b] of buckets) {
      if (b.reset <= now) buckets.delete(k);
    }
  }
  const b = buckets.get(key);
  if (!b || b.reset <= now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }
  if (b.count >= limit) {
    return { allowed: false, retryAfter: Math.max(1, Math.ceil((b.reset - now) / 1000)) };
  }
  b.count += 1;
  return { allowed: true, retryAfter: 0 };
}

export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim().slice(0, 64) || "unknown";
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim().slice(0, 64);
  return "unknown";
}

/* ---------------- CSRF: same-origin check for mutations ----------------
   Browsers always send Origin/Referer on fetch POST/PATCH/DELETE.
   Reject only when present AND mismatched (curl/healthchecks have none). */

export function assertSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  if (!origin && !referer) return true;
  const host = (req.headers.get("host") || req.nextUrl.host || "").toLowerCase();
  try {
    if (origin) {
      if (new URL(origin).host.toLowerCase() !== host) return false;
    } else if (referer) {
      if (new URL(referer).host.toLowerCase() !== host) return false;
    }
  } catch {
    return false;
  }
  return true;
}

/* ---------------- input validation ---------------- */

export function clampStr(v: unknown, max = 500): string {
  return String(v ?? "")
    .trim()
    .slice(0, max);
}

export function clampNullable(v: unknown, max = 500): string | null {
  const s = String(v ?? "").trim();
  return s ? s.slice(0, max) : null;
}

export function safeInt(v: unknown, def = 0, min = 0, max = 100_000_000): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return def;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

export function safeId(v: unknown): number | null {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0 || n > 2_147_483_647) return null;
  return Math.floor(n);
}

/** Bangladeshi mobile: 10-15 digits after stripping non-digits */
export function isValidPhone(v: string): boolean {
  const d = v.replace(/\D/g, "");
  return d.length >= 10 && d.length <= 15;
}

export function normalizePhone(v: string): string {
  return v.replace(/\D/g, "").slice(-11);
}

export function isValidSlug(v: string): boolean {
  return v.length > 0 && v.length <= 220 && /^[\w\u0980-\u09FF-]+$/.test(v);
}

/** Only allow first-party or https image URLs (blocks javascript:, data:, etc.) */
export function isSafeImageUrl(v: string): boolean {
  if (!v) return true;
  if (v.length > 2000) return false;
  if (v.startsWith("/uploads/") || v.startsWith("/images/")) {
    return !v.includes("..") && !/[\s<>\"'\\]/.test(v);
  }
  if (v.startsWith("https://")) {
    return !/[\s<>\"'\\]/.test(v);
  }
  return false;
}

export const MIN_PASSWORD_LEN = 8;

export function passwordError(pw: string): string | null {
  if (pw.length < MIN_PASSWORD_LEN) return "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।";
  if (pw.length > 128) return "পাসওয়ার্ড অনেক বড় হয়ে গেছে।";
  return null;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
