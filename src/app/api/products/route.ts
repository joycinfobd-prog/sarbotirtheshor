import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { slugify } from "@/lib/format";
import {
  assertSameOrigin,
  clampNullable,
  clampStr,
  isSafeImageUrl,
  isValidSlug,
  safeId,
  safeInt,
} from "@/lib/security";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "অনুমতি নেই" }, { status: 401 });
  const rows = await db.select().from(products).orderBy(desc(products.createdAt));
  return NextResponse.json({ ok: true, products: rows });
}

export function toProductValues(body: Record<string, unknown>) {
  const nameBn = clampStr(body.nameBn, 200);
  const imagesRaw = Array.isArray(body.images)
    ? (body.images as unknown[]).map((u) => clampStr(u, 2000)).filter((u) => u && isSafeImageUrl(u)).slice(0, 8)
    : [];
  return {
    nameBn,
    slug: body.slug ? clampStr(body.slug, 220) : slugify(nameBn || "product"),
    code: clampNullable(body.code, 40),
    categoryId: body.categoryId ? safeId(body.categoryId) : null,
    price: safeInt(body.price, 0, 0, 100_000_000),
    oldPrice: body.oldPrice ? safeInt(body.oldPrice, 0, 0, 100_000_000) || null : null,
    image: clampNullable(body.image, 2000),
    images: imagesRaw,
    shortDesc: clampNullable(body.shortDesc, 500),
    description: clampNullable(body.description, 8000),
    stock: safeInt(body.stock, 0, 0, 1_000_000),
    isLive: body.isLive === undefined ? true : Boolean(body.isLive),
    isOffer: Boolean(body.isOffer),
    offerLabel: clampNullable(body.offerLabel, 60),
    sortOrder: safeInt(body.sortOrder, 0, 0, 1_000_000),
  };
}

export function validateProductValues(values: ReturnType<typeof toProductValues>): string | null {
  if (!values.nameBn) return "পণ্যের নাম দিন।";
  if (!isValidSlug(values.slug)) return "স্লাগে শুধু অক্ষর, সংখ্যা, - ও _ ব্যবহার করুন।";
  if (values.image && !isSafeImageUrl(values.image)) return "ছবির লিংক সঠিক নয়।";
  return null;
}

async function categoryExists(id: number | null): Promise<boolean> {
  if (id === null) return true;
  const rows = await db.select({ id: categories.id }).from(categories).where(eq(categories.id, id)).limit(1);
  return rows.length > 0;
}

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "অননুমোদিত রিকোয়েস্ট।" }, { status: 403 });
  }
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "অনুমতি নেই" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const values = toProductValues(body);
  const err = validateProductValues(values);
  if (err) return NextResponse.json({ ok: false, error: err }, { status: 400 });
  if (!(await categoryExists(values.categoryId))) {
    return NextResponse.json({ ok: false, error: "ক্যাটাগরি পাওয়া যায়নি।" }, { status: 400 });
  }
  try {
    const [row] = await db.insert(products).values(values).returning();
    return NextResponse.json({ ok: true, product: row });
  } catch {
    return NextResponse.json({ ok: false, error: "একই স্লাগ/কোডে পণ্য আছে। নাম বদলে আবার চেষ্টা করুন।" }, { status: 409 });
  }
}
