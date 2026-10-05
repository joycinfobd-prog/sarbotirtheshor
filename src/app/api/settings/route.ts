import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { DEFAULT_SETTINGS, SETTINGS_FIELDS } from "@/lib/site";
import { assertSameOrigin, clampStr, isSafeImageUrl } from "@/lib/security";

// Only known keys can be written — blocks junk/privilege keys
const ALLOWED_KEYS = new Set([
  ...SETTINGS_FIELDS.map((f) => f.key),
  ...Object.keys(DEFAULT_SETTINGS),
]);

const IMAGE_KEYS = new Set(
  SETTINGS_FIELDS.filter((f) => f.type === "image").map((f) => f.key),
);

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "অনুমতি নেই" }, { status: 401 });
  const rows = await db.select().from(settings);
  return NextResponse.json({ ok: true, settings: rows });
}

export async function PATCH(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "অননুমোদিত রিকোয়েস্ট।" }, { status: 403 });
  }
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "অনুমতি নেই" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const entries = Object.entries(body as Record<string, unknown>).slice(0, 60);

  for (const [key, value] of entries) {
    if (!ALLOWED_KEYS.has(key)) continue;
    if (value != null && IMAGE_KEYS.has(key)) {
      const url = clampStr(value, 2000);
      if (url && !isSafeImageUrl(url)) {
        return NextResponse.json({ ok: false, error: `“${key}” এর ছবির লিংক সঠিক নয়।` }, { status: 400 });
      }
    }
    if (key === "whatsapp" && value != null) {
      const digits = String(value).replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 15) {
        return NextResponse.json({ ok: false, error: "সঠিক WhatsApp নম্বর দিন।" }, { status: 400 });
      }
    }
    const exists = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
    const val = value == null ? null : clampStr(value, 8000);
    if (exists.length) {
      await db.update(settings).set({ value: val }).where(eq(settings.key, key));
    } else {
      await db.insert(settings).values({ key, value: val });
    }
  }
  return NextResponse.json({ ok: true });
}
