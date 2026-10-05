import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { getSessionUser, hashPassword } from "@/lib/auth";
import {
  assertSameOrigin,
  clampStr,
  isValidPhone,
  passwordError,
  safeId,
} from "@/lib/security";

async function requireOwner() {
  const me = await getSessionUser();
  if (!me) return { error: "অনুমতি নেই", status: 401 as const, me: null };
  if (me.role !== "owner") {
    return {
      error: "শুধুমাত্র মালিক (owner) ব্যবহারকারী ব্যবস্থাপনা করতে পারবেন।",
      status: 403 as const,
      me: null,
    };
  }
  return { error: null, status: 200 as const, me };
}

async function activeOwnerCount(): Promise<number> {
  const rows = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(and(eq(adminUsers.role, "owner"), eq(adminUsers.isActive, true)));
  return rows.length;
}

export async function GET() {
  const { error, status, me } = await requireOwner();
  if (error || !me) return NextResponse.json({ ok: false, error }, { status });
  const rows = await db
    .select({
      id: adminUsers.id,
      name: adminUsers.name,
      phone: adminUsers.phone,
      role: adminUsers.role,
      isActive: adminUsers.isActive,
      createdAt: adminUsers.createdAt,
    })
    .from(adminUsers)
    .orderBy(asc(adminUsers.id));
  return NextResponse.json({ ok: true, users: rows });
}

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "অননুমোদিত রিকোয়েস্ট।" }, { status: 403 });
  }
  const { error, status } = await requireOwner();
  if (error) return NextResponse.json({ ok: false, error }, { status });

  const body = await req.json().catch(() => ({}));
  const name = clampStr(body.name, 120);
  const phone = clampStr(body.phone, 30);
  const password = String(body.password ?? "").slice(0, 128);
  const role = body.role === "owner" ? "owner" : "admin";

  if (name.length < 2) {
    return NextResponse.json({ ok: false, error: "সঠিক নাম দিন।" }, { status: 400 });
  }
  if (!isValidPhone(phone)) {
    return NextResponse.json({ ok: false, error: "সঠিক মোবাইল নম্বর দিন।" }, { status: 400 });
  }
  const pwErr = passwordError(password);
  if (pwErr) return NextResponse.json({ ok: false, error: pwErr }, { status: 400 });

  try {
    const [row] = await db
      .insert(adminUsers)
      .values({ name, phone, passwordHash: hashPassword(password), role, isActive: true })
      .returning();
    return NextResponse.json({ ok: true, user: { id: row.id, name: row.name, phone: row.phone } });
  } catch {
    return NextResponse.json({ ok: false, error: "এই মোবাইল নম্বর দিয়ে ইতোমধ্যে অ্যাকাউন্ট আছে।" }, { status: 409 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "অননুমোদিত রিকোয়েস্ট।" }, { status: 403 });
  }
  const auth = await requireOwner();
  if (auth.error || !auth.me) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }
  const me = auth.me;

  const body = await req.json().catch(() => ({}));
  const id = safeId(body.id);
  if (!id) return NextResponse.json({ ok: false, error: "ব্যবহারকারী নির্বাচন করুন।" }, { status: 400 });

  const rows = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
  const target = rows[0];
  if (!target) return NextResponse.json({ ok: false, error: "ব্যবহারকারী পাওয়া যায়নি।" }, { status: 404 });

  const patch: Partial<typeof adminUsers.$inferInsert> = {};
  if (body.name !== undefined) {
    const name = clampStr(body.name, 120);
    if (name.length < 2) return NextResponse.json({ ok: false, error: "সঠিক নাম দিন।" }, { status: 400 });
    patch.name = name;
  }
  if (body.phone !== undefined) {
    const phone = clampStr(body.phone, 30);
    if (!isValidPhone(phone)) {
      return NextResponse.json({ ok: false, error: "সঠিক মোবাইল নম্বর দিন।" }, { status: 400 });
    }
    patch.phone = phone;
  }

  const wantsRole = body.role !== undefined ? (body.role === "owner" ? "owner" : "admin") : null;
  const wantsActive = body.isActive !== undefined ? Boolean(body.isActive) : null;

  // Nobody may change their own role or deactivate themselves (prevents lockout)
  if (id === me.id && ((wantsRole && wantsRole !== target.role) || wantsActive === false)) {
    return NextResponse.json(
      { ok: false, error: "নিজের ভূমিকা বা সক্রিয় অবস্থা নিজে বদলানো যাবে না।" },
      { status: 400 },
    );
  }

  // Never leave the shop without an active owner
  const demotingOwner =
    target.role === "owner" &&
    target.isActive &&
    (wantsRole === "admin" || wantsActive === false);
  if (demotingOwner && (await activeOwnerCount()) <= 1) {
    return NextResponse.json(
      { ok: false, error: "শেষ সক্রিয় মালিককে সরানো/ডিমোট করা যাবে না।" },
      { status: 400 },
    );
  }

  if (wantsRole) patch.role = wantsRole;
  if (wantsActive !== null) patch.isActive = wantsActive;

  const newPassword = String(body.password ?? "");
  if (newPassword) {
    const pwErr = passwordError(newPassword.slice(0, 128));
    if (pwErr) return NextResponse.json({ ok: false, error: pwErr }, { status: 400 });
    patch.passwordHash = hashPassword(newPassword.slice(0, 128));
  }

  try {
    await db.update(adminUsers).set(patch).where(eq(adminUsers.id, id));
  } catch {
    return NextResponse.json({ ok: false, error: "এই মোবাইল নম্বর ইতোমধ্যে ব্যবহৃত।" }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "অননুমোদিত রিকোয়েস্ট।" }, { status: 403 });
  }
  const auth = await requireOwner();
  if (auth.error || !auth.me) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }
  const body = await req.json().catch(() => ({}));
  const id = safeId(body.id);
  if (!id) return NextResponse.json({ ok: false, error: "ব্যবহারকারী নির্বাচন করুন।" }, { status: 400 });
  if (id === auth.me.id) {
    return NextResponse.json({ ok: false, error: "নিজের অ্যাকাউন্ট মুছতে পারবেন না।" }, { status: 400 });
  }

  const rows = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
  const target = rows[0];
  if (!target) return NextResponse.json({ ok: false, error: "ব্যবহারকারী পাওয়া যায়নি।" }, { status: 404 });
  if (target.role === "owner" && target.isActive && (await activeOwnerCount()) <= 1) {
    return NextResponse.json({ ok: false, error: "শেষ সক্রিয় মালিককে মুছতে পারবেন না।" }, { status: 400 });
  }

  await db.delete(adminUsers).where(eq(adminUsers.id, id));
  return NextResponse.json({ ok: true });
}
