import { NextRequest, NextResponse } from "next/server";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orderEvents, orders, products, settings } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { orderCode, orderMessage, waLink } from "@/lib/format";
import {
  assertSameOrigin,
  checkRateLimit,
  clampNullable,
  clampStr,
  clientIp,
  isValidPhone,
  safeInt,
} from "@/lib/security";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "অনুমতি নেই" }, { status: 401 });
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
  return NextResponse.json({ ok: true, orders: rows });
}

async function deliveryConfig(): Promise<{ fee: number; freeMin: number }> {
  try {
    const rows = await db
      .select()
      .from(settings)
      .where(inArray(settings.key, ["delivery_fee", "free_delivery_min"]));
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""]));
    const fee = Number(map.delivery_fee);
    const freeMin = Number(map.free_delivery_min);
    return {
      fee: Number.isFinite(fee) && fee >= 0 ? Math.floor(fee) : 120,
      freeMin: Number.isFinite(freeMin) && freeMin >= 0 ? Math.floor(freeMin) : 5000,
    };
  } catch {
    return { fee: 120, freeMin: 5000 };
  }
}

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "অননুমোদিত রিকোয়েস্ট।" }, { status: 403 });
  }
  const rl = checkRateLimit(`order:${clientIp(req)}`, 15, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "অনেকগুলো অর্ডার পাঠিয়েছেন। কিছুক্ষণ পর আবার চেষ্টা করুন।" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  const body = await req.json().catch(() => ({}));
  const customerName = clampStr(body.customerName, 120);
  const phone = clampStr(body.phone, 30);
  const address = clampStr(body.address, 1000);
  const note = clampNullable(body.note, 1000);
  const paymentMethod = body.paymentMethod === "bkash" ? "bkash" : "cod";
  const items: Record<string, unknown>[] = Array.isArray(body.items) ? body.items.slice(0, 20) : [];

  if (customerName.length < 2 || !isValidPhone(phone) || address.length < 8) {
    return NextResponse.json(
      { ok: false, error: "সঠিক নাম, মোবাইল নম্বর ও সম্পূর্ণ ঠিকানা দিন।" },
      { status: 400 },
    );
  }
  if (items.length === 0) {
    return NextResponse.json({ ok: false, error: "কার্টে কোনো পণ্য নেই।" }, { status: 400 });
  }

  // SECURITY: never trust client prices — re-price every line from the database.
  const cleanItems: {
    productId: number;
    nameBn: string;
    slug: string | null;
    image: string | null;
    price: number;
    qty: number;
  }[] = [];
  for (const it of items) {
    const productId = safeInt(it.productId, 0, 1, 2_147_483_647);
    const qty = safeInt(it.qty, 1, 1, 20);
    if (!productId) {
      return NextResponse.json({ ok: false, error: "কার্টে অজানা পণ্য আছে। আবার চেষ্টা করুন।" }, { status: 400 });
    }
    const rows = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    const p = rows[0];
    if (!p || !p.isLive) {
      return NextResponse.json(
        { ok: false, error: `“${it.nameBn ? String(it.nameBn).slice(0, 60) : "একটি পণ্য"}” এখন পাওয়া যাচ্ছে না।` },
        { status: 400 },
      );
    }
    if (p.stock < qty) {
      return NextResponse.json(
        { ok: false, error: `“${p.nameBn}” স্টকে পর্যাপ্ত নেই।` },
        { status: 400 },
      );
    }
    cleanItems.push({
      productId: p.id,
      nameBn: p.nameBn,
      slug: p.slug,
      image: p.image,
      price: p.price,
      qty,
    });
  }

  const subtotal = cleanItems.reduce((s, i) => s + i.price * i.qty, 0);
  const { fee, freeMin } = await deliveryConfig();
  const deliveryFee = subtotal >= freeMin ? 0 : fee;
  const total = subtotal + deliveryFee;
  const code = orderCode();

  const [order] = await db
    .insert(orders)
    .values({
      code,
      customerName,
      phone,
      address,
      note,
      items: cleanItems,
      subtotal,
      deliveryFee,
      total,
      status: "pending",
      paymentMethod,
      location: "অর্ডার গ্রহণ করা হয়েছে",
    })
    .returning();

  await db.insert(orderEvents).values({
    orderId: order.id,
    status: "pending",
    location: "অর্ডার গ্রহণ করা হয়েছে",
    note: "নতুন অর্ডার এসেছে",
  });

  // স্টক আপডেট
  for (const item of cleanItems) {
    const rows = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
    const p = rows[0];
    if (!p) continue;
    await db
      .update(products)
      .set({ stock: Math.max(0, p.stock - item.qty), soldCount: p.soldCount + item.qty })
      .where(eq(products.id, p.id));
  }

  const message = orderMessage({
    code,
    customerName,
    phone,
    address,
    note,
    items: cleanItems,
    total,
    deliveryFee,
    paymentMethod,
  });

  return NextResponse.json({
    ok: true,
    orderCode: code,
    total,
    deliveryFee,
    whatsappUrl: waLink(message),
    message,
  });
}
