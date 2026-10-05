import { NextRequest, NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { slugify } from "@/lib/format";
import {
  assertSameOrigin,
  clampNullable,
  clampStr,
  isSafeImageUrl,
  isValidSlug,
  safeInt,
} from "@/lib/security";

export async function GET() {
  const rows = await db.select().from(categories).orderBy(asc(categories.sortOrder));
  // Guests only see active categories; admins see all (for management)
  const user = await getSessionUser();
  const out = user ? rows : rows.filter((r) => r.isActive);
  return NextResponse.json({ ok: true, categories: out });
}

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "অননুমোদিত রিকোয়েস্ট।" }, { status: 403 });
  }
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "অনুমতি নেই" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const nameBn = clampStr(body.nameBn, 140);
  if (!nameBn) return NextResponse.json({ ok: false, error: "ক্যাটাগরির নাম দিন।" }, { status: 400 });

  const slug = body.slug ? clampStr(body.slug, 140) : slugify(nameBn);
  if (!isValidSlug(slug)) {
    return NextResponse.json({ ok: false, error: "স্লাগে শুধু অক্ষর, সংখ্যা, - ও _ ব্যবহার করুন।" }, { status: 400 });
  }
  const image = clampNullable(body.image, 2000);
  if (image && !isSafeImageUrl(image)) {
    return NextResponse.json({ ok: false, error: "ছবির লিংক সঠিক নয়।" }, { status: 400 });
  }

  try {
    const [row] = await db
      .insert(categories)
      .values({
        nameBn,
        slug,
        icon: clampNullable(body.icon, 100),
        image,
        description: clampNullable(body.description, 2000),
        sortOrder: safeInt(body.sortOrder, 0, 0, 1_000_000),
        isActive: body.isActive === undefined ? true : Boolean(body.isActive),
      })
      .returning();
    return NextResponse.json({ ok: true, category: row });
  } catch {
    return NextResponse.json({ ok: false, error: "একই স্লাগে ক্যাটাগরি আছে।" }, { status: 409 });
  }
}
