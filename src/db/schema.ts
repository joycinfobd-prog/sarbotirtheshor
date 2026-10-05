import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export type OrderItem = {
  productId: number | null;
  nameBn: string;
  slug?: string | null;
  image?: string | null;
  price: number;
  qty: number;
};

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  nameBn: varchar("name_bn", { length: 140 }).notNull(),
  slug: varchar("slug", { length: 140 }).notNull().unique(),
  icon: text("icon"),
  image: text("image"),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 40 }),
  nameBn: varchar("name_bn", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 220 }).notNull().unique(),
  categoryId: integer("category_id").references(() => categories.id),
  price: integer("price").notNull().default(0),
  oldPrice: integer("old_price"),
  image: text("image"),
  images: jsonb("images").$type<string[]>().default([]),
  shortDesc: text("short_desc"),
  description: text("description"),
  stock: integer("stock").notNull().default(0),
  soldCount: integer("sold_count").notNull().default(0),
  isLive: boolean("is_live").notNull().default(true),
  isOffer: boolean("is_offer").notNull().default(false),
  offerLabel: varchar("offer_label", { length: 60 }),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 24 }).notNull().unique(),
  customerName: varchar("customer_name", { length: 140 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull(),
  address: text("address").notNull(),
  note: text("note"),
  items: jsonb("items").$type<OrderItem[]>().notNull(),
  subtotal: integer("subtotal").notNull().default(0),
  deliveryFee: integer("delivery_fee").notNull().default(0),
  total: integer("total").notNull().default(0),
  status: varchar("status", { length: 30 }).notNull().default("pending"),
  paymentMethod: varchar("payment_method", { length: 30 }).notNull().default("cod"),
  location: text("location"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderEvents = pgTable("order_events", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  status: varchar("status", { length: 30 }).notNull(),
  location: text("location"),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  key: varchar("key", { length: 80 }).primaryKey(),
  value: text("value"),
});

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("admin"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  role: varchar("role", { length: 120 }),
  rating: integer("rating").notNull().default(5),
  text: text("text"),
  avatar: text("avatar"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});
