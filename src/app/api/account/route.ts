import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { getSessionUser, hashPassword, verifyPassword } from "@/lib/auth";
import {
  assertSameOrigin,
  checkRateLimit,
  clampStr,
  passwordError,
} from "@/lib/security";

export async function GET() {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "অনুমতি নেই" }, { status: 401 });
  return NextResponse.json({ ok: true, user: me });
}

/** Change own name / password. Password change requires current password. */
export async function PATCH(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "অননুমোদিত রিকোয়েস্ট।" }, { status: 403 });
  }
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "অনুমতি নেই" }, { status: 401 });

  const rl = checkRateLimit(`account:${me.id}`, 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "অনেকবার চেষ্টা করেছেন। কিছুক্ষণ পর আবার চেষ্টা করুন।" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  const body = await req.json().catch(() => ({}));
  const rows = await db.select().from(adminUsers).where(eq(adminUsers.id, me.id)).limit(1);
  const row = rows[0];
  if (!row || !row.isActive) {
    return NextResponse.json({ ok: false, error: "অ্যাকাউন্ট পাওয়া যায়নি।" }, { status: 404 });
  }

  const patch: Partial<typeof adminUsers.$inferInsert> = {};

  if (body.name !== undefined) {
    const name = clampStr(body.name, 120);
    if (name.length < 2) {
      return NextResponse.json({ ok: false, error: "সঠিক নাম দিন।" }, { status: 400 });
    }
    patch.name = name;
  }

  const newPassword = String(body.newPassword ?? "");
  if (newPassword) {
    const current = String(body.currentPassword ?? "");
    if (!verifyPassword(current, row.passwordHash)) {
      return NextResponse.json({ ok: false, error: "বর্তমান পাসওয়ার্ড সঠিক নয়।" }, { status: 400 });
    }
    const err = passwordError(newPassword);
    if (err) return NextResponse.json({ ok: false, error: err }, { status: 400 });
    patch.passwordHash = hashPassword(newPassword);
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: "পরিবর্তনের কিছু নেই।" }, { status: 400 });
  }

  await db.update(adminUsers).set(patch).where(eq(adminUsers.id, me.id));
  return NextResponse.json({ ok: true });
}
