import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, orderEvents, orders, products, reviews, settings } from "@/db/schema";
import { DEFAULT_SETTINGS, type SettingsMap } from "@/lib/site";

export type { SettingsMap };

export async function getSettings(): Promise<SettingsMap> {
  try {
    const rows = await db.select().from(settings);
    const map: SettingsMap = { ...DEFAULT_SETTINGS };
    for (const r of rows) if (r.value != null) map[r.key] = r.value;
    return map;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function getCategories(includeHidden = false) {
  try {
    const rows = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.sortOrder), asc(categories.id));
    return includeHidden ? rows : rows.filter((r) => r.isActive);
  } catch {
    return [];
  }
}

export async function getProducts(
  opts: { categoryId?: number; offer?: boolean; live?: boolean; limit?: number } = {},
) {
  try {
    const rows = await db
      .select()
      .from(products)
      .orderBy(asc(products.sortOrder), desc(products.createdAt));
    let out = rows;
    if (opts.live !== false) out = out.filter((p) => p.isLive);
    if (opts.categoryId) out = out.filter((p) => p.categoryId === opts.categoryId);
    if (opts.offer) out = out.filter((p) => p.isOffer);
    if (opts.limit) out = out.slice(0, opts.limit);
    return out;
  } catch {
    return [];
  }
}

export async function getAllProducts() {
  try {
    return await db.select().from(products).orderBy(asc(products.sortOrder), desc(products.createdAt));
  } catch {
    return [];
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const rows = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function getReviews() {
  try {
    const rows = await db.select().from(reviews).orderBy(asc(reviews.sortOrder), asc(reviews.id));
    return rows.filter((r) => r.isActive);
  } catch {
    return [];
  }
}

export async function getRecentOrders(limit = 8) {
  try {
    return await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit);
  } catch {
    return [];
  }
}

export async function getOrderEvents(orderId: number) {
  try {
    return await db
      .select()
      .from(orderEvents)
      .where(eq(orderEvents.orderId, orderId))
      .orderBy(asc(orderEvents.createdAt));
  } catch {
    return [];
  }
}
