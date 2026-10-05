"use client";

import Link from "next/link";
import { useState } from "react";
import { MessageCircle, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { taka, waLink } from "@/lib/format";

export default function CartPage() {
  const { items, total, setQty, remove, ready } = useCart();
  const [phone, setPhone] = useState("8801794608874");

  const summary = items
    .map((it, i) => `${i + 1}. ${it.nameBn} × ${it.qty} = ${taka(it.price * it.qty)}`)
    .join("\n");
  const message = `আসসালামু আলাইকুম, আমি অর্ডার করতে চাই:\n\n${summary}\n\nসর্বমোট: ${taka(total)}`;

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10">
      <h1 className="section-title text-3xl text-navy">শপিং কার্ট</h1>
      <div className="gold-rule mt-2 w-32" />

      {!ready ? (
        <div className="mt-8 text-ink-soft">লোড হচ্ছে...</div>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-paper-deep bg-white p-14 text-center">
          <div className="font-display text-xl text-navy">আপনার কার্ট খালি</div>
          <p className="mt-2 text-ink-soft">পছন্দের পণ্যগুলো কার্টে যোগ করুন।</p>
          <Link href="/shop" className="btn btn-navy mt-5">কেনাকাটা শুরু করুন</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-4">
            {items.map((it, i) => (
              <div key={`${it.productId}-${i}`} className="flex gap-4 rounded-2xl border border-paper-deep bg-white p-4">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-paper">
                  {it.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.image} alt={it.nameBn} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="font-semibold leading-snug text-navy">{it.nameBn}</div>
                  <div className="tnum mt-1 text-wa-deep">{taka(it.price)}</div>
                  <div className="mt-auto flex items-center gap-3 pt-3">
                    <div className="flex items-center gap-1 rounded-lg border border-paper-deep">
                      <button className="px-2 py-1.5 text-navy" onClick={() => setQty(i, it.qty - 1)} aria-label="কমান">
                        <Minus size={15} />
                      </button>
                      <span className="tnum w-7 text-center text-sm">{it.qty}</span>
                      <button className="px-2 py-1.5 text-navy" onClick={() => setQty(i, it.qty + 1)} aria-label="বাড়ান">
                        <Plus size={15} />
                      </button>
                    </div>
                    <button
                      className="flex items-center gap-1 text-sm text-alert transition hover:underline"
                      onClick={() => remove(i)}
                    >
                      <Trash2 size={15} /> মুছুন
                    </button>
                  </div>
                </div>
                <div className="tnum font-display text-lg font-bold text-navy">
                  {taka(it.price * it.qty)}
                </div>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-2xl border border-paper-deep bg-white p-6">
            <h2 className="section-title text-xl text-navy">অর্ডার সামারি</h2>
            <div className="gold-rule mt-2 w-20" />
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">পণ্যের মূল্য</dt>
                <dd className="tnum font-semibold text-navy">{taka(total)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">ডেলিভারি চার্জ</dt>
                <dd className="tnum font-semibold text-navy">
                  {total >= 5000 ? "ফ্রি" : taka(120)}
                </dd>
              </div>
              <div className="border-t border-paper-deep pt-3">
                <div className="flex justify-between">
                  <dt className="font-semibold text-navy">সর্বমোট</dt>
                  <dd className="tnum font-display text-xl font-bold text-wa-deep">
                    {taka(total + (total >= 5000 ? 0 : 120))}
                  </dd>
                </div>
              </div>
            </dl>

            <Link href="/checkout" className="btn btn-navy mt-6 w-full">
              অর্ডার সম্পন্ন করুন
            </Link>
            <Link href="/shop" className="btn btn-ghost mt-3 w-full">
              আরও পণ্য দেখুন
            </Link>

            <div className="mt-6 rounded-xl bg-gold-soft p-4">
              <div className="text-sm font-semibold text-gold-deep">সরাসরি WhatsApp অর্ডার</div>
              <input
                className="field mt-2 text-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-label="WhatsApp নম্বর"
              />
              <a
                href={waLink(message, phone.replace(/\D/g, ""))}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-wa mt-3 w-full text-sm"
              >
                <MessageCircle size={16} /> WhatsApp এ পাঠান
              </a>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
