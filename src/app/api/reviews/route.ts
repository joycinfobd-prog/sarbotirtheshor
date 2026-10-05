import { NextRequest, NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import {
  assertSameOrigin,
  clampNullable,
  clampStr,
  isSafeImageUrl,
  safeId,
  safeInt,
} from "@/lib/security";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "অনুমতি নেই" }, { status: 401 });
  const rows = await db.select().from(reviews).orderBy(asc(reviews.sortOrder));
  return NextResponse.json({ ok: true, reviews: rows });
}

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "অননুমোদিত রিকোয়েস্ট।" }, { status: 403 });
  }
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "অনুমতি নেই" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const name = clampStr(body.name, 120);
  if (!name) return NextResponse.json({ ok: false, error: "গ্রাহকের নাম দিন।" }, { status: 400 });
  const avatar = clampNullable(body.avatar, 2000);
  if (avatar && !isSafeImageUrl(avatar)) {
    return NextResponse.json({ ok: false, error: "ছবির লিংক সঠিক নয়।" }, { status: 400 });
  }

  const [row] = await db
    .insert(reviews)
    .values({
      name,
      role: clampNullable(body.role, 120),
      rating: Math.max(1, Math.min(5, safeInt(body.rating, 5, 1, 5))),
      text: clampNullable(body.text, 2000),
      avatar,
      sortOrder: safeInt(body.sortOrder, 0, 0, 1_000_000),
      isActive: body.isActive === undefined ? true : Boolean(body.isActive),
    })
    .returning();
  return NextResponse.json({ ok: true, review: row });
}

export async function PATCH(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "অননুমোদিত রিকোয়েস্ট।" }, { status: 403 });
  }
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "অনুমতি নেই" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const id = safeId(body.id);
  if (!id) return NextResponse.json({ ok: false, error: "মতামত নির্বাচন করুন।" }, { status: 400 });
  if (body.avatar) {
    const avatar = clampStr(body.avatar, 2000);
    if (!isSafeImageUrl(avatar)) {
      return NextResponse.json({ ok: false, error: "ছবির লিংক সঠিক নয়।" }, { status: 400 });
    }
  }
  const [row] = await db
    .update(reviews)
    .set({
      name: body.name ? clampStr(body.name, 120) : undefined,
      role: body.role !== undefined ? clampNullable(body.role, 120) : undefined,
      rating:
        body.rating !== undefined
          ? Math.max(1, Math.min(5, safeInt(body.rating, 5, 1, 5)))
          : undefined,
      text: body.text !== undefined ? clampNullable(body.text, 2000) : undefined,
      avatar: body.avatar !== undefined ? clampNullable(body.avatar, 2000) : undefined,
      sortOrder: body.sortOrder !== undefined ? safeInt(body.sortOrder, 0, 0, 1_000_000) : undefined,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
    })
    .where(eq(reviews.id, id))
    .returning();
  return NextResponse.json({ ok: true, review: row });
}

export async function DELETE(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "অননুমোদিত রিকোয়েস্ট।" }, { status: 403 });
  }
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "অনুমতি নেই" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const id = safeId(body.id);
  if (!id) return NextResponse.json({ ok: false, error: "মতামত নির্বাচন করুন।" }, { status: 400 });
  await db.delete(reviews).where(eq(reviews.id, id));
  return NextResponse.json({ ok: true });
}
