import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import {
  clearCookieOptions,
  createSessionToken,
  getSessionUser,
  sessionCookieOptions,
  verifyPassword,
  SESSION_COOKIE,
} from "@/lib/auth";
import {
  assertSameOrigin,
  checkRateLimit,
  clampStr,
  clientIp,
  sleep,
} from "@/lib/security";

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "অননুমোদিত রিকোয়েস্ট।" }, { status: 403 });
  }
  const ip = clientIp(req);
  const body = await req.json().catch(() => ({}));
  const phone = clampStr(body.phone, 30);
  const password = String(body.password ?? "").slice(0, 128);

  // Brute-force protection: per IP + per phone buckets
  const byIp = checkRateLimit(`login:ip:${ip}`, 30, 60_000);
  const byPhone = checkRateLimit(`login:phone:${ip}:${phone}`, 8, 60_000);
  const rl = byIp.allowed ? byPhone : byIp;
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "অনেকবার ভুল চেষ্টা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  if (!phone || !password) {
    return NextResponse.json({ ok: false, error: "মোবাইল নম্বর ও পাসওয়ার্ড দিন।" }, { status: 400 });
  }

  const rows = await db.select().from(adminUsers).where(eq(adminUsers.phone, phone)).limit(1);
  const user = rows[0];
  if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
    await sleep(400); // slow down password guessing
    return NextResponse.json({ ok: false, error: "ভুল মোবাইল নম্বর বা পাসওয়ার্ড।" }, { status: 401 });
  }

  const res = NextResponse.json({
    ok: true,
    user: { id: user.id, name: user.name, role: user.role },
  });
  res.cookies.set(SESSION_COOKIE, createSessionToken(user.id), sessionCookieOptions());
  return res;
}

export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({ ok: true, user });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", clearCookieOptions());
  return res;
}
