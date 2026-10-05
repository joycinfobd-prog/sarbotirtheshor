"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { ImageField } from "@/components/admin/ImageField";

type CategoryRow = {
  id: number;
  nameBn: string;
  slug: string;
  image: string | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
};

const EMPTY = { id: 0, nameBn: "", slug: "", image: "", description: "", sortOrder: "0", isActive: true };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [form, setForm] = useState<typeof EMPTY | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const [cRes, pRes] = await Promise.all([fetch("/api/categories"), fetch("/api/products")]);
    const cData = await cRes.json();
    const pData = await pRes.json();
    if (cData.ok) setCategories(cData.categories);
    if (pData.ok) {
      const map: Record<number, number> = {};
      for (const p of pData.products) {
        if (p.categoryId) map[p.categoryId] = (map[p.categoryId] ?? 0) + 1;
      }
      setCounts(map);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function edit(c: CategoryRow) {
    setForm({
      id: c.id,
      nameBn: c.nameBn,
      slug: c.slug,
      image: c.image ?? "",
      description: c.description ?? "",
      sortOrder: String(c.sortOrder),
      isActive: c.isActive,
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(form.id ? `/api/categories/${form.id}` : "/api/categories", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameBn: form.nameBn,
          slug: form.slug || undefined,
          image: form.image,
          description: form.description,
          sortOrder: Number(form.sortOrder || 0),
          isActive: form.isActive,
        }),
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

  async function toggleActive(c: CategoryRow) {
    await fetch(`/api/categories/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !c.isActive }),
    });
    await load();
  }

  async function remove(c: CategoryRow) {
    const n = counts[c.id] ?? 0;
    if (
      !window.confirm(
        `“${c.nameBn}” মুছে ফেলতে চান?${n > 0 ? ` (এই ক্যাটাগরির ${n}টি পণ্য ক্যাটাগরি ছাড়া হয়ে যাবে)` : ""}`,
      )
    )
      return;
    const res = await fetch(`/api/categories/${c.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      window.alert(data.error || "মুছতে পারা যায়নি।");
      return;
    }
    await load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="section-title text-2xl text-navy sm:text-3xl">ক্যাটাগরি</h1>
          <p className="mt-1 text-sm text-ink-soft">ক্যাটাগরি যোগ, সম্পাদনা, মুছে ফেলা ও শো/হাইড</p>
        </div>
        <button className="btn btn-navy" onClick={() => setForm({ ...EMPTY })}>
          <Plus size={18} /> নতুন ক্যাটাগরি
        </button>
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-paper-deep bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-paper-deep text-left text-xs uppercase tracking-wider text-ink-soft">
              <th className="px-5 py-3">ক্যাটাগরি</th>
              <th className="px-5 py-3">স্লাগ</th>
              <th className="px-5 py-3">পণ্য</th>
              <th className="px-5 py-3">ক্রম</th>
              <th className="px-5 py-3">স্ট্যাটাস</th>
              <th className="px-5 py-3 text-right">কাজ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-ink-soft">লোড হচ্ছে...</td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-ink-soft">কোনো ক্যাটাগরি নেই</td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id} className="border-b border-paper-deep/70 last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-paper">
                        {c.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.image} alt="" className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <span className="font-semibold text-navy">{c.nameBn}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink-soft">{c.slug}</td>
                  <td className="tnum px-5 py-3 font-semibold text-navy">{counts[c.id] ?? 0} টি</td>
                  <td className="tnum px-5 py-3 text-ink-soft">{c.sortOrder}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleActive(c)}
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                        c.isActive
                          ? "border-wa/40 bg-wa/15 text-wa-deep"
                          : "border-paper-deep bg-paper text-ink-soft"
                      }`}
                    >
                      {c.isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                      {c.isActive ? "দৃশ্যমান" : "লুকানো"}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => edit(c)}
                        className="rounded-lg border border-paper-deep p-2 text-navy transition hover:border-navy-mid hover:bg-paper"
                        aria-label="সম্পাদনা"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => remove(c)}
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
          <form onSubmit={save} className="my-8 w-full max-w-lg rounded-2xl bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-navy">
                {form.id ? "ক্যাটাগরি সম্পাদনা" : "নতুন ক্যাটাগরি"}
              </h2>
              <button type="button" onClick={() => setForm(null)} className="rounded-lg p-2 hover:bg-paper" aria-label="বন্ধ">
                <X size={20} />
              </button>
            </div>
            <div className="gold-rule mt-2 w-24" />

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">ক্যাটাগরির নাম *</label>
                <input className="field" required value={form.nameBn} onChange={(e) => setForm({ ...form, nameBn: e.target.value })} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">স্লাগ (খালি রাখলে স্বয়ংক্রিয়)</label>
                <input
                  className="field"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="rudraksha-mala"
                />
              </div>
              <ImageField label="ক্যাটাগরির ছবি" value={form.image} onChange={(url) => setForm({ ...form, image: url })} />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">বিবরণ</label>
                <textarea className="field min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">সাজানোর ক্রম</label>
                <input className="field" inputMode="numeric" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-navy">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                ওয়েবসাইটে দেখান
              </label>
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
