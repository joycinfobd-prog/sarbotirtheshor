import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orderEvents, orders } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { ORDER_STATUS_KEYS } from "@/lib/site";
import { assertSameOrigin, clampNullable, clampStr, safeId } from "@/lib/security";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "অননুমোদিত রিকোয়েস্ট।" }, { status: 403 });
  }
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "অনুমতি নেই" }, { status: 401 });

  const { id } = await params;
  const orderId = safeId(id);
  if (!orderId) return NextResponse.json({ ok: false, error: "সঠিক অর্ডার নয়।" }, { status: 400 });
  const body = await req.json().catch(() => ({}));

  const patch: Partial<typeof orders.$inferInsert> = {};
  if (body.status !== undefined) {
    const st = clampStr(body.status, 30);
    if (!ORDER_STATUS_KEYS.includes(st)) {
      return NextResponse.json({ ok: false, error: "সঠিক স্ট্যাটাস নয়।" }, { status: 400 });
    }
    patch.status = st;
  }
  if (body.location !== undefined) patch.location = clampNullable(body.location, 300);
  if (body.note !== undefined) patch.note = clampNullable(body.note, 1000);
  if (body.address !== undefined) {
    const address = clampStr(body.address, 1000);
    if (address.length < 8) {
      return NextResponse.json({ ok: false, error: "সঠিক ঠিকানা দিন।" }, { status: 400 });
    }
    patch.address = address;
  }
  if (body.phone !== undefined) patch.phone = clampStr(body.phone, 30);
  if (body.customerName !== undefined) patch.customerName = clampStr(body.customerName, 120);

  const [updated] = await db.update(orders).set(patch).where(eq(orders.id, orderId)).returning();
  if (!updated) return NextResponse.json({ ok: false, error: "অর্ডার পাওয়া যায়নি" }, { status: 404 });

  if (body.status || body.location) {
    await db.insert(orderEvents).values({
      orderId,
      status: updated.status,
      location: updated.location,
      note: body.eventNote
        ? clampStr(body.eventNote, 500)
        : `স্ট্যাটাস আপডেট: ${updated.status}`,
    });
  }

  return NextResponse.json({ ok: true, order: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "অননুমোদিত রিকোয়েস্ট।" }, { status: 403 });
  }
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "অনুমতি নেই" }, { status: 401 });
  const { id } = await params;
  const orderId = safeId(id);
  if (!orderId) return NextResponse.json({ ok: false, error: "সঠিক অর্ডার নয়।" }, { status: 400 });
  await db.delete(orderEvents).where(eq(orderEvents.orderId, orderId));
  await db.delete(orders).where(eq(orders.id, orderId));
  return NextResponse.json({ ok: true });
}
