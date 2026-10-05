import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSessionUser } from "@/lib/auth";
import { assertSameOrigin, checkRateLimit } from "@/lib/security";

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// ~3MB file max (base64 string is ~33% larger)
const MAX_DATAURL_LEN = 4_200_000;
const MAX_FILE_BYTES = 3_000_000;

function magicOk(buf: Buffer, ext: string): boolean {
  if (ext === "jpg") return buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  if (ext === "png") {
    return (
      buf.length > 8 &&
      buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
      buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
    );
  }
  if (ext === "webp") {
    return (
      buf.length > 12 &&
      buf.toString("ascii", 0, 4) === "RIFF" &&
      buf.toString("ascii", 8, 12) === "WEBP"
    );
  }
  return false;
}

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "অননুমোদিত রিকোয়েস্ট।" }, { status: 403 });
  }
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "অনুমতি নেই" }, { status: 401 });

  const rl = checkRateLimit(`upload:${user.id}`, 30, 600_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "অনেকগুলো ছবি আপলোড করেছেন। কিছুক্ষণ পর আবার চেষ্টা করুন।" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  const body = await req.json().catch(() => ({}));
  const dataUrl = String(body.data ?? "");
  if (!dataUrl || dataUrl.length > MAX_DATAURL_LEN) {
    return NextResponse.json({ ok: false, error: "ছবির সাইজ সর্বোচ্চ ৩MB হতে পারবে।" }, { status: 400 });
  }
  const match = /^data:([a-z/+.]+);base64,(.+)$/i.exec(dataUrl);
  if (!match) return NextResponse.json({ ok: false, error: "ছবির ডেটা সঠিক নয়।" }, { status: 400 });

  const mime = match[1].toLowerCase();
  const ext = ALLOWED[mime];
  if (!ext) return NextResponse.json({ ok: false, error: "শুধু JPG, PNG বা WEBP ছবি দেওয়া যাবে।" }, { status: 400 });

  let buf: Buffer;
  try {
    buf = Buffer.from(match[2], "base64");
  } catch {
    return NextResponse.json({ ok: false, error: "ছবির ডেটা সঠিক নয়।" }, { status: 400 });
  }
  if (buf.length === 0 || buf.length > MAX_FILE_BYTES) {
    return NextResponse.json({ ok: false, error: "ছবির সাইজ সর্বোচ্চ ৩MB হতে পারবে।" }, { status: 400 });
  }
  // Verify real file type from magic bytes (MIME in data URL can be faked)
  if (!magicOk(buf, ext)) {
    return NextResponse.json({ ok: false, error: "এটি বৈধ ছবি ফাইল নয়।" }, { status: 400 });
  }

  const fileName = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), buf);

  return NextResponse.json({ ok: true, url: `/uploads/${fileName}` });
}
