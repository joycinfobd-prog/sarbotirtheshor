import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { toProductValues, validateProductValues } from "../route";
import { assertSameOrigin, safeId } from "@/lib/security";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "অননুমোদিত রিকোয়েস্ট।" }, { status: 403 });
  }
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "অনুমতি নেই" }, { status: 401 });
  const { id } = await params;
  const pid = safeId(id);
  if (!pid) return NextResponse.json({ ok: false, error: "সঠিক পণ্য নয়।" }, { status: 400 });
  const body = await req.json().catch(() => ({}));

  if (body.isLive !== undefined && Object.keys(body).length === 1) {
    const [toggled] = await db
      .update(products)
      .set({ isLive: Boolean(body.isLive) })
      .where(eq(products.id, pid))
      .returning();
    return NextResponse.json({ ok: true, product: toggled });
  }

  const values = toProductValues(body);
  const err = validateProductValues(values);
  if (err) return NextResponse.json({ ok: false, error: err }, { status: 400 });
  if (values.categoryId) {
    const c = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, values.categoryId))
      .limit(1);
    if (!c.length) return NextResponse.json({ ok: false, error: "ক্যাটাগরি পাওয়া যায়নি।" }, { status: 400 });
  }
  try {
    const [row] = await db.update(products).set(values).where(eq(products.id, pid)).returning();
    return NextResponse.json({ ok: true, product: row });
  } catch {
    return NextResponse.json({ ok: false, error: "একই স্লাগ/কোডে পণ্য আছে।" }, { status: 409 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "অননুমোদিত রিকোয়েস্ট।" }, { status: 403 });
  }
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "অনুমতি নেই" }, { status: 401 });
  const { id } = await params;
  const pid = safeId(id);
  if (!pid) return NextResponse.json({ ok: false, error: "সঠিক পণ্য নয়।" }, { status: 400 });
  await db.delete(products).where(eq(products.id, pid));
  return NextResponse.json({ ok: true });
}
