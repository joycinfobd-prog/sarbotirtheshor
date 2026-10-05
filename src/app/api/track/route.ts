import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orderEvents, orders } from "@/db/schema";
import { checkRateLimit, clientIp, normalizePhone } from "@/lib/security";

export async function GET(req: NextRequest) {
  const rl = checkRateLimit(`track:${clientIp(req)}`, 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "অনেকবার চেষ্টা করেছেন। কিছুক্ষণ পর আবার চেষ্টা করুন।" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  const phone = (req.nextUrl.searchParams.get("phone") ?? "").slice(0, 30);
  const code = (req.nextUrl.searchParams.get("code") ?? "").trim().slice(0, 24);
  const key = normalizePhone(phone);

  // Require a full phone number or order code — blocks enumeration with short guesses
  if (key.length < 10 && code.length < 4) {
    return NextResponse.json(
      { ok: false, error: "সম্পূর্ণ মোবাইল নম্বর বা অর্ডার নং দিন।" },
      { status: 400 },
    );
  }

  const all = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(500);
  const matched = all
    .filter((o) => {
      const byPhone = key.length >= 10 && normalizePhone(o.phone) === key;
      const byCode = code.length >= 4 && o.code.toLowerCase() === code.toLowerCase();
      return Boolean(byPhone || byCode);
    })
    .slice(0, 20);

  const withEvents = await Promise.all(
    matched.map(async (o) => ({
      ...o,
      events: await db
        .select()
        .from(orderEvents)
        .where(eq(orderEvents.orderId, o.id))
        .orderBy(desc(orderEvents.createdAt)),
    })),
  );

  return NextResponse.json({ ok: true, orders: withEvents });
}
