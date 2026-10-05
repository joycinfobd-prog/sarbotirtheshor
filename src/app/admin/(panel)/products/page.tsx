"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { ImageField } from "@/components/admin/ImageField";
import { taka } from "@/lib/format";

type Category = { id: number; nameBn: string; slug: string };

type ProductRow = {
  id: number;
  code: string | null;
  nameBn: string;
  slug: string;
  categoryId: number | null;
  price: number;
  oldPrice: number | null;
  image: string | null;
  shortDesc: string | null;
  description: string | null;
  stock: number;
  isLive: boolean;
  isOffer: boolean;
  offerLabel: string | null;
  sortOrder: number;
};

const EMPTY = {
  id: 0,
  code: "",
  nameBn: "",
  categoryId: "",
  price: "",
  oldPrice: "",
  image: "",
  shortDesc: "",
  description: "",
  stock: "10",
  isLive: true,
  isOffer: false,
  offerLabel: "",
  sortOrder: "0",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "live" | "offline" | "offer">("all");
  const [form, setForm] = useState<typeof EMPTY | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const [pRes, cRes] = await Promise.all([fetch("/api/products"), fetch("/api/categories")]);
    const pData = await pRes.json();
    const cData = await cRes.json();
    if (pData.ok) setProducts(pData.products);
    if (cData.ok) setCategories(cData.categories);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = products;
    if (filter === "live") list = list.filter((p) => p.isLive);
    if (filter === "offline") list = list.filter((p) => !p.isLive);
    if (filter === "offer") list = list.filter((p) => p.isOffer);
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) => p.nameBn.toLowerCase().includes(q) || (p.code ?? "").toLowerCase().includes(q),
    );
  }, [products, query, filter]);

  function edit(p: ProductRow) {
    setForm({
      id: p.id,
      code: p.code ?? "",
      nameBn: p.nameBn,
      categoryId: p.categoryId ? String(p.categoryId) : "",
      price: String(p.price),
      oldPrice: p.oldPrice ? String(p.oldPrice) : "",
      image: p.image ?? "",
      shortDesc: p.shortDesc ?? "",
      description: p.description ?? "",
      stock: String(p.stock),
      isLive: p.isLive,
      isOffer: p.isOffer,
      offerLabel: p.offerLabel ?? "",
      sortOrder: String(p.sortOrder),
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);
    const payload = {
      nameBn: form.nameBn,
      code: form.code,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      price: Number(form.price || 0),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
      image: form.image,
      shortDesc: form.shortDesc,
      description: form.description,
      stock: Number(form.stock || 0),
      isLive: form.isLive,
      isOffer: form.isOffer,
      offerLabel: form.offerLabel,
      sortOrder: Number(form.sortOrder || 0),
    };
    try {
      const res = await fetch(form.id ? `/api/products/${form.id}` : "/api/products", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "সংরক্ষণ করা যায়নি।");
      setForm(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "কিছু ভুল হয়েছে।");
    } finally {
      setSaving(false);
    }
  }

  async function toggleLive(p: ProductRow) {
    await fetch(`/api/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isLive: !p.isLive }),
    });
    await load();
  }

  async function remove(p: ProductRow) {
    if (!window.confirm(`“${p.nameBn}” পণ্যটি মুছে ফেলতে চান?`)) return;
    await fetch(`/api/products/${p.id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="section-title text-2xl text-navy sm:text-3xl">পণ্যসমূহ</h1>
          <p className="mt-1 text-sm text-ink-soft">পণ্য যোগ, সম্পাদনা, মুছে ফেলা ও লাইভ স্ট্যাটাস নিয়ন্ত্রণ</p>
        </div>
        <button className="btn btn-navy" onClick={() => setForm({ ...EMPTY })}>
          <Plus size={18} /> নতুন পণ্য যোগ করুন
        </button>
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-paper-deep bg-white px-4 py-3">
        <Search size={18} className="text-ink-soft" />
        <input
          className="w-full bg-transparent text-sm outline-none"
          placeholder="পণ্যের নাম বা কোড দিয়ে খুঁজুন..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="tnum shrink-0 text-sm text-ink-soft">{filtered.length} টি</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(
          [
            { key: "all", label: `সব (${products.length})` },
            { key: "live", label: `লাইভ (${products.filter((p) => p.isLive).length})` },
            { key: "offline", label: `অফলাইন (${products.filter((p) => !p.isLive).length})` },
            { key: "offer", label: `অফার (${products.filter((p) => p.isOffer).length})` },
          ] as const
        ).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              filter === f.key
                ? "border-navy bg-navy text-white"
                : "border-paper-deep bg-white text-navy hover:border-navy-mid"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-paper-deep bg-white">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-paper-deep text-left text-xs uppercase tracking-wider text-ink-soft">
              <th className="px-5 py-3">পণ্য</th>
              <th className="px-5 py-3">ক্যাটাগরি</th>
              <th className="px-5 py-3">মূল্য</th>
              <th className="px-5 py-3">স্টক</th>
              <th className="px-5 py-3">স্ট্যাটাস</th>
              <th className="px-5 py-3 text-right">কাজ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-ink-soft">লোড হচ্ছে...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-ink-soft">কোনো পণ্য পাওয়া যায়নি</td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="border-b border-paper-deep/70 last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-paper">
                        {p.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image} alt="" className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div>
                        <div className="font-semibold text-navy">{p.nameBn}</div>
                        <div className="tnum text-xs text-ink-soft">{p.code || "—"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink-soft">
                    {categories.find((c) => c.id === p.categoryId)?.nameBn ?? "—"}
                  </td>
                  <td className="px-5 py-3">
                    <div className="tnum font-semibold text-navy">{taka(p.price)}</div>
                    {p.oldPrice ? <div className="tnum text-xs text-ink-soft line-through">{taka(p.oldPrice)}</div> : null}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`tnum font-semibold ${p.stock === 0 ? "text-alert" : "text-wa-deep"}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => toggleLive(p)}
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                          p.isLive
                            ? "border-wa/40 bg-wa/15 text-wa-deep"
                            : "border-paper-deep bg-paper text-ink-soft"
                        }`}
                      >
                        {p.isLive ? <Eye size={13} /> : <EyeOff size={13} />}
                        {p.isLive ? "লাইভ" : "অফলাইন"}
                      </button>
                      {p.isOffer ? (
                        <span className="rounded-full border border-gold/50 bg-gold-soft px-2.5 py-1 text-xs font-semibold text-gold-deep">
                          অফার
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => edit(p)}
                        className="rounded-lg border border-paper-deep p-2 text-navy transition hover:border-navy-mid hover:bg-paper"
                        aria-label="সম্পাদনা"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => remove(p)}
                        className="rounded-lg border border-paper-deep p-2 text-alert transition hover:border-alert hover:bg-alert/10"
                        aria-label="মুছুন"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {form ? (
        <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/50 p-4">
          <form onSubmit={save} className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-navy">
                {form.id ? "পণ্য সম্পাদনা" : "নতুন পণ্য যোগ করুন"}
              </h2>
              <button type="button" onClick={() => setForm(null)} className="rounded-lg p-2 hover:bg-paper" aria-label="বন্ধ">
                <X size={20} />
              </button>
            </div>
            <div className="gold-rule mt-2 w-24" />

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-navy">পণ্যের নাম *</label>
                <input className="field" required value={form.nameBn} onChange={(e) => setForm({ ...form, nameBn: e.target.value })} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">পণ্য কোড</label>
                <input className="field" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="SR-1001" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">ক্যাটাগরি</label>
                <select className="field" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                  <option value="">— নির্বাচন করুন —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.nameBn}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">মূল্য (৳) *</label>
                <input className="field" inputMode="numeric" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">আগের মূল্য (৳)</label>
                <input className="field" inputMode="numeric" value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: e.target.value })} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">স্টক</label>
                <input className="field" inputMode="numeric" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">সাজানোর ক্রম</label>
                <input className="field" inputMode="numeric" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <ImageField label="পণ্যের ছবি" value={form.image} onChange={(url) => setForm({ ...form, image: url })} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-navy">সংক্ষিপ্ত বিবরণ</label>
                <input className="field" value={form.shortDesc} onChange={(e) => setForm({ ...form, shortDesc: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-navy">বিস্তারিত বিবরণ</label>
                <textarea className="field min-h-[110px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">অফার লেবেল</label>
                <input className="field" value={form.offerLabel} onChange={(e) => setForm({ ...form, offerLabel: e.target.value })} placeholder="২০% ছাড়" />
              </div>
              <div className="flex items-end gap-4 pb-1">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-navy">
                  <input type="checkbox" checked={form.isLive} onChange={(e) => setForm({ ...form, isLive: e.target.checked })} />
                  ওয়েবসাইটে লাইভ
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-navy">
                  <input type="checkbox" checked={form.isOffer} onChange={(e) => setForm({ ...form, isOffer: e.target.checked })} />
                  বিশেষ অফারে দেখান
                </label>
              </div>
            </div>

            {error ? (
              <div className="mt-4 rounded-xl border border-alert/30 bg-alert/10 px-4 py-3 text-sm text-alert">{error}</div>
            ) : null}

            <div className="mt-6 flex gap-3">
              <button type="submit" disabled={saving} className="btn btn-navy disabled:opacity-60">
                {saving ? <Loader2 size={17} className="animate-spin" /> : null}
                সংরক্ষণ করুন
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setForm(null)}>বাতিল</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
