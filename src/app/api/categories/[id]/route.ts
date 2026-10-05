import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import {
  assertSameOrigin,
  clampNullable,
  clampStr,
  isSafeImageUrl,
  isValidSlug,
  safeId,
  safeInt,
} from "@/lib/security";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "অননুমোদিত রিকোয়েস্ট।" }, { status: 403 });
  }
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "অনুমতি নেই" }, { status: 401 });
  const { id } = await params;
  const cid = safeId(id);
  if (!cid) return NextResponse.json({ ok: false, error: "সঠিক ক্যাটাগরি নয়।" }, { status: 400 });
  const body = await req.json().catch(() => ({}));

  if (body.nameBn !== undefined && !clampStr(body.nameBn, 140)) {
    return NextResponse.json({ ok: false, error: "ক্যাটাগরির নাম দিন।" }, { status: 400 });
  }
  if (body.slug) {
    const slug = clampStr(body.slug, 140);
    if (!isValidSlug(slug)) {
      return NextResponse.json({ ok: false, error: "স্লাগে শুধু অক্ষর, সংখ্যা, - ও _ ব্যবহার করুন।" }, { status: 400 });
    }
  }
  if (body.image) {
    const image = clampStr(body.image, 2000);
    if (!isSafeImageUrl(image)) {
      return NextResponse.json({ ok: false, error: "ছবির লিংক সঠিক নয়।" }, { status: 400 });
    }
  }

  try {
    const [row] = await db
      .update(categories)
      .set({
        nameBn: body.nameBn !== undefined ? clampStr(body.nameBn, 140) : undefined,
        slug: body.slug ? clampStr(body.slug, 140) : undefined,
        icon: body.icon !== undefined ? clampNullable(body.icon, 100) : undefined,
        image: body.image !== undefined ? clampNullable(body.image, 2000) : undefined,
        description: body.description !== undefined ? clampNullable(body.description, 2000) : undefined,
        sortOrder: body.sortOrder !== undefined ? safeInt(body.sortOrder, 0, 0, 1_000_000) : undefined,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
      })
      .where(eq(categories.id, cid))
      .returning();
    return NextResponse.json({ ok: true, category: row });
  } catch {
    return NextResponse.json({ ok: false, error: "একই স্লাগে ক্যাটাগরি আছে।" }, { status: 409 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "অননুমোদিত রিকোয়েস্ট।" }, { status: 403 });
  }
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "অনুমতি নেই" }, { status: 401 });
  const { id } = await params;
  const cid = safeId(id);
  if (!cid) return NextResponse.json({ ok: false, error: "সঠিক ক্যাটাগরি নয়।" }, { status: 400 });
  await db.update(products).set({ categoryId: null }).where(eq(products.categoryId, cid));
  await db.delete(categories).where(eq(categories.id, cid));
  return NextResponse.json({ ok: true });
}
