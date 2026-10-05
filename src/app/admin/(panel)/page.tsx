"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ClipboardList, IndianRupee, Package, Sparkles, Truck } from "lucide-react";
import { ORDER_STATUS } from "@/lib/site";
import { taka } from "@/lib/format";

type Product = { id: number; nameBn: string; price: number; stock: number; isLive: boolean; isOffer: boolean; soldCount: number };
type Order = {
  id: number;
  code: string;
  customerName: string;
  phone: string;
  status: string;
  total: number;
  createdAt: string;
  items: { nameBn: string; qty: number }[];
};

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [pRes, oRes] = await Promise.all([fetch("/api/products"), fetch("/api/orders")]);
      const pData = await pRes.json();
      const oData = await oRes.json();
      if (pData.ok) setProducts(pData.products);
      if (oData.ok) setOrders(oData.orders);
      setLoading(false);
    })();
  }, []);

  const revenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
  const pending = orders.filter((o) => o.status === "pending").length;
  const delivered = orders.filter((o) => o.status === "delivered").length;
  const lowStock = products.filter((p) => p.stock <= 3).length;

  const stats = [
    { label: "মোট পণ্য", value: String(products.length), icon: <Package size={22} />, href: "/admin/products" },
    { label: "অপেক্ষমাণ অর্ডার", value: String(pending), icon: <ClipboardList size={22} />, href: "/admin/orders" },
    { label: "মোট বিক্রি (৳)", value: taka(revenue), icon: <IndianRupee size={22} />, href: "/admin/orders" },
    { label: "ডেলিভারি সম্পন্ন", value: String(delivered), icon: <Truck size={22} />, href: "/admin/orders" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="section-title text-2xl text-navy sm:text-3xl">ড্যাশবোর্ড</h1>
          <p className="mt-1 text-sm text-ink-soft">স্টোরের সামগ্রিক অবস্থা এক নজরে</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products" className="btn btn-navy px-4 py-2 text-sm">+ নতুন পণ্য</Link>
          <Link href="/admin/orders" className="btn btn-ghost px-4 py-2 text-sm">অর্ডার দেখুন</Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card-lift rounded-2xl border border-paper-deep bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-gold">{s.icon}</div>
              <Sparkles size={16} className="text-gold" />
            </div>
            <div className="tnum mt-4 font-display text-2xl font-bold text-navy">{s.value}</div>
            <div className="mt-1 text-sm text-ink-soft">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-paper-deep bg-white">
          <div className="flex items-center justify-between border-b border-paper-deep px-5 py-4">
            <h2 className="font-display text-lg font-bold text-navy">সাম্প্রতিক অর্ডার</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-navy-mid hover:underline">সব দেখুন →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-paper-deep text-left text-xs uppercase tracking-wider text-ink-soft">
                  <th className="px-5 py-3">অর্ডার</th>
                  <th className="px-5 py-3">গ্রাহক</th>
                  <th className="px-5 py-3">স্ট্যাটাস</th>
                  <th className="px-5 py-3 text-right">মোট</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-ink-soft">লোড হচ্ছে...</td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-ink-soft">এখনো কোনো অর্ডার নেই</td>
                  </tr>
                ) : (
                  orders.slice(0, 6).map((o) => {
                    const tone = ORDER_STATUS[o.status] ?? ORDER_STATUS.pending;
                    return (
                      <tr key={o.id} className="border-b border-paper-deep/70 last:border-0">
                        <td className="px-5 py-3">
                          <div className="tnum font-semibold text-navy">{o.code}</div>
                          <div className="text-xs text-ink-soft">
                            {new Date(o.createdAt).toLocaleDateString("bn-BD")}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="text-navy">{o.customerName}</div>
                          <div className="tnum text-xs text-ink-soft">{o.phone}</div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${tone.tone}`}>
                            {tone.label}
                          </span>
                        </td>
                        <td className="tnum px-5 py-3 text-right font-semibold text-navy">{taka(o.total)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-paper-deep bg-white p-5">
            <h2 className="font-display text-lg font-bold text-navy">স্টক সতর্কতা</h2>
            <p className="mt-1 text-sm text-ink-soft">
              {lowStock > 0 ? `${lowStock} টি পণ্যের স্টক কম বা শেষ হয়ে আসছে` : "সব পণ্যের স্টক পর্যাপ্ত"}
            </p>
            <ul className="mt-4 space-y-2">
              {products
                .filter((p) => p.stock <= 3)
                .slice(0, 5)
                .map((p) => (
                  <li key={p.id} className="flex items-center justify-between rounded-xl bg-paper px-3 py-2 text-sm">
                    <span className="line-clamp-1 text-navy">{p.nameBn}</span>
                    <span className={`tnum ml-2 shrink-0 font-semibold ${p.stock === 0 ? "text-alert" : "text-gold-deep"}`}>
                      {p.stock} পিস
                    </span>
                  </li>
                ))}
              {products.filter((p) => p.stock <= 3).length === 0 ? (
                <li className="text-sm text-ink-soft">সব ঠিক আছে ✓</li>
              ) : null}
            </ul>
          </div>

          <div className="rounded-2xl border border-paper-deep bg-white p-5">
            <h2 className="font-display text-lg font-bold text-navy">দ্রুত কাজ</h2>
            <div className="mt-4 grid gap-2">
              <Link href="/admin/products" className="btn btn-navy w-full text-sm">পণ্য যোগ / সম্পাদনা</Link>
              <Link href="/admin/orders" className="btn btn-ghost w-full text-sm">অর্ডার স্ট্যাটাস ও লোকেশন আপডেট</Link>
              <Link href="/admin/settings" className="btn btn-ghost w-full text-sm">লোগো, লেখা ও নাম্বার পরিবর্তন</Link>
              <Link href="/admin/settings#users" className="btn btn-gold w-full text-sm">অন্য কাউকে অ্যাক্সেস দিন</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
