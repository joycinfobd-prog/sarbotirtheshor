"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { taka } from "@/lib/format";

export default function CheckoutPage() {
  const { items, total, clear, ready } = useCart();
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    address: "",
    note: "",
    paymentMethod: "cod",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ code: string; total: number; whatsappUrl: string } | null>(null);

  const deliveryFee = total >= 5000 ? 0 : 120;
  const grandTotal = total + deliveryFee;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((it) => ({
            productId: it.productId,
            nameBn: it.nameBn,
            slug: it.slug,
            image: it.image,
            price: it.price,
            qty: it.qty,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "অর্ডার পাঠানো যায়নি।");

      setDone({ code: data.orderCode, total: data.total, whatsappUrl: data.whatsappUrl });
      clear();
      window.open(data.whatsappUrl, "_blank", "noopener");
    } catch (err) {
      setError(err instanceof Error ? err.message : "কিছু ভুল হয়েছে।");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-16">
        <div className="rounded-2xl border border-wa/40 bg-white p-10 text-center shadow-sm">
          <CheckCircle2 size={58} className="mx-auto text-wa-deep" />
          <h1 className="mt-5 font-display text-3xl font-bold text-navy">অর্ডার সফল হয়েছে!</h1>
          <p className="mt-3 text-ink-soft">
            আপনার অর্ডার নম্বর <span className="tnum font-semibold text-navy">{done.code}</span>।
            অর্ডারটি আমাদের ওয়েবসাইটে সংরক্ষিত হয়েছে এবং হোয়াটসঅ্যাপে বিস্তারিত মেসেজ পাঠানো হয়েছে।
          </p>
          <div className="mt-6 rounded-xl bg-paper p-4 text-left text-sm text-ink-soft">
            <div className="flex justify-between">
              <span>সর্বমোট</span>
              <span className="tnum font-semibold text-navy">{taka(done.total)}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span>পেমেন্ট</span>
              <span className="font-semibold text-navy">ক্যাশ অন ডেলিভারি</span>
            </div>
          </div>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a href={done.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-wa">
              <MessageCircle size={18} /> WhatsApp মেসেজ দেখুন
            </a>
            <Link href={`/track?phone=${encodeURIComponent(form.phone)}`} className="btn btn-navy">
              অর্ডার ট্র্যাক করুন
            </Link>
            <Link href="/shop" className="btn btn-ghost">আরও কেনাকাটা</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10">
      <h1 className="section-title text-3xl text-navy">চেকআউট</h1>
      <div className="gold-rule mt-2 w-32" />

      {!ready ? (
        <div className="mt-8 text-ink-soft">লোড হচ্ছে...</div>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-paper-deep bg-white p-14 text-center">
          <div className="font-display text-xl text-navy">কার্টে কোনো পণ্য নেই</div>
          <Link href="/shop" className="btn btn-navy mt-5">পণ্য দেখুন</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-5 rounded-2xl border border-paper-deep bg-white p-6">
            <h2 className="section-title text-xl text-navy">ডেলিভারি তথ্য</h2>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy">আপনার নাম *</label>
              <input
                required
                className="field"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                placeholder="সম্পূর্ণ নাম লিখুন"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy">মোবাইল নম্বর *</label>
              <input
                required
                className="field"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="01XXXXXXXXX"
                inputMode="tel"
              />
              <p className="mt-1.5 text-xs text-ink-soft">
                এই নম্বর দিয়ে পরে <Link href="/track" className="text-navy-mid underline">অর্ডার ট্র্যাক</Link> করতে পারবেন।
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy">সম্পূর্ণ ঠিকানা *</label>
              <textarea
                required
                className="field min-h-[96px]"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="বাসা/রোড, এলাকা, থানা, জেলা"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy">অতিরিক্ত নোট</label>
              <textarea
                className="field min-h-[80px]"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="বিশেষ কিছু জানাতে চাইলে লিখুন"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-navy">পেমেন্ট পদ্ধতি</label>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { v: "cod", t: "ক্যাশ অন ডেলিভারি", s: "পণ্য হাতে পেয়ে পেমেন্ট" },
                  { v: "bkash", t: "বিকাশ / নগদ", s: "অগ্রিম পেমেন্ট" },
                ].map((opt) => (
                  <label
                    key={opt.v}
                    className={`cursor-pointer rounded-xl border p-4 transition ${
                      form.paymentMethod === opt.v
                        ? "border-navy-mid bg-navy/5"
                        : "border-paper-deep hover:border-navy-soft/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      className="sr-only"
                      checked={form.paymentMethod === opt.v}
                      onChange={() => setForm({ ...form, paymentMethod: opt.v })}
                    />
                    <div className="font-semibold text-navy">{opt.t}</div>
                    <div className="text-xs text-ink-soft">{opt.s}</div>
                  </label>
                ))}
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-alert/30 bg-alert/10 px-4 py-3 text-sm text-alert">{error}</div>
            ) : null}
          </div>

          <aside className="h-fit rounded-2xl border border-paper-deep bg-white p-6">
            <h2 className="section-title text-xl text-navy">আপনার অর্ডার</h2>
            <div className="gold-rule mt-2 w-20" />
            <ul className="mt-5 space-y-3 text-sm">
              {items.map((it, i) => (
                <li key={`${it.productId}-${i}`} className="flex justify-between gap-3">
                  <span className="text-ink-soft">
                    {it.nameBn} <span className="tnum">× {it.qty}</span>
                  </span>
                  <span className="tnum shrink-0 font-semibold text-navy">{taka(it.price * it.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-5 space-y-2 border-t border-paper-deep pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">পণ্যের মূল্য</dt>
                <dd className="tnum font-semibold text-navy">{taka(total)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">ডেলিভারি চার্জ</dt>
                <dd className="tnum font-semibold text-navy">{deliveryFee === 0 ? "ফ্রি" : taka(deliveryFee)}</dd>
              </div>
              <div className="flex justify-between border-t border-paper-deep pt-3">
                <dt className="font-semibold text-navy">সর্বমোট</dt>
                <dd className="tnum font-display text-xl font-bold text-wa-deep">{taka(grandTotal)}</dd>
              </div>
            </dl>

            <button type="submit" disabled={loading} className="btn btn-navy mt-6 w-full disabled:opacity-60">
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> পাঠানো হচ্ছে...
                </>
              ) : (
                "অর্ডার নিশ্চিত করুন"
              )}
            </button>
            <p className="mt-3 text-center text-xs text-ink-soft">
              অর্ডার করলে তা আমাদের ওয়েবসাইটে সংরক্ষিত হবে এবং হোয়াটসঅ্যাপে মেসেজ যাবে।
            </p>
          </aside>
        </form>
      )}
    </div>
  );
}
