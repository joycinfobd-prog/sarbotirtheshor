"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Loader2, MapPin, MessageCircle, RefreshCw, Trash2 } from "lucide-react";
import { ORDER_STATUS, ORDER_STATUS_KEYS } from "@/lib/site";
import { taka, waLink } from "@/lib/format";

type OrderItem = { productId: number | null; nameBn: string; price: number; qty: number };
type Order = {
  id: number;
  code: string;
  customerName: string;
  phone: string;
  address: string;
  note: string | null;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: string;
  paymentMethod: string;
  location: string | null;
  createdAt: string;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, { status: string; location: string; note: string }>>({});

  async function load() {
    setLoading(true);
    const res = await fetch("/api/orders");
    const data = await res.json();
    if (data.ok) setOrders(data.orders);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  function draftFor(o: Order) {
    return (
      drafts[o.id] ?? {
        status: o.status,
        location: o.location ?? "",
        note: o.note ?? "",
      }
    );
  }

  async function save(o: Order) {
    setSavingId(o.id);
    const d = draftFor(o);
    await fetch(`/api/orders/${o.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: d.status, location: d.location, note: d.note }),
    });
    await load();
    setSavingId(null);
  }

  async function remove(o: Order) {
    if (!window.confirm(`অর্ডার ${o.code} মুছে ফেলতে চান?`)) return;
    await fetch(`/api/orders/${o.id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="section-title text-2xl text-navy sm:text-3xl">অর্ডারসমূহ</h1>
          <p className="mt-1 text-sm text-ink-soft">
            অর্ডারের স্ট্যাটাস ও লোকেশন আপডেট করুন — গ্রাহক ট্র্যাকিং পেজে সাথে সাথে দেখতে পাবেন
          </p>
        </div>
        <button className="btn btn-ghost px-4 py-2 text-sm" onClick={load}>
          <RefreshCw size={16} /> রিফ্রেশ
        </button>
      </div>

      <div className="scroll-row mt-5 flex gap-2 overflow-x-auto pb-2">
        {[{ key: "all", label: "সব অর্ডার" }, ...ORDER_STATUS_KEYS.map((k) => ({ key: k, label: ORDER_STATUS[k].label }))].map(
          (f) => {
            const count = f.key === "all" ? orders.length : orders.filter((o) => o.status === f.key).length;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${
                  filter === f.key
                    ? "border-navy bg-navy text-white"
                    : "border-paper-deep bg-white text-navy hover:border-navy-mid"
                }`}
              >
                {f.label} <span className="tnum">({count})</span>
              </button>
            );
          },
        )}
      </div>

      <div className="mt-5 space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-paper-deep bg-white p-10 text-center text-ink-soft">
            লোড হচ্ছে...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-paper-deep bg-white p-12 text-center text-ink-soft">
            এই ধরনের কোনো অর্ডার নেই
          </div>
        ) : (
          filtered.map((o) => {
            const tone = ORDER_STATUS[o.status] ?? ORDER_STATUS.pending;
            const d = draftFor(o);
            const isOpen = openId === o.id;
            return (
              <div key={o.id} className="overflow-hidden rounded-2xl border border-paper-deep bg-white">
                <button
                  className="flex w-full flex-wrap items-center gap-4 px-5 py-4 text-left"
                  onClick={() => setOpenId(isOpen ? null : o.id)}
                >
                  <div className="min-w-[150px]">
                    <div className="tnum font-display text-lg font-bold text-navy">{o.code}</div>
                    <div className="text-xs text-ink-soft">{new Date(o.createdAt).toLocaleString("bn-BD")}</div>
                  </div>
                  <div className="min-w-[160px]">
                    <div className="font-semibold text-navy">{o.customerName}</div>
                    <div className="tnum text-xs text-ink-soft">{o.phone}</div>
                  </div>
                  <div className="hidden min-w-[180px] text-sm text-ink-soft lg:block">
                    <div className="flex items-center gap-1">
                      <MapPin size={14} className="text-gold-deep" />
                      <span className="line-clamp-1">{o.location || "লোকেশন নেই"}</span>
                    </div>
                    <div className="line-clamp-1">{o.address}</div>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone.tone}`}>{tone.label}</span>
                  <div className="tnum ml-auto font-display text-lg font-bold text-wa-deep">{taka(o.total)}</div>
                  <ChevronDown size={18} className={`text-ink-soft transition ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen ? (
                  <div className="border-t border-paper-deep bg-paper/60 px-5 py-5">
                    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                      <div>
                        <h3 className="font-semibold text-navy">অর্ডারের পণ্য</h3>
                        <ul className="mt-3 space-y-2">
                          {o.items.map((it, i) => (
                            <li key={i} className="flex justify-between rounded-xl bg-white px-4 py-2.5 text-sm">
                              <span className="text-navy">
                                {it.nameBn} <span className="tnum text-ink-soft">× {it.qty}</span>
                              </span>
                              <span className="tnum font-semibold text-navy">{taka(it.price * it.qty)}</span>
                            </li>
                          ))}
                        </ul>
                        <dl className="mt-4 space-y-1.5 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-ink-soft">পণ্যের মূল্য</dt>
                            <dd className="tnum font-semibold text-navy">{taka(o.subtotal)}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-ink-soft">ডেলিভারি চার্জ</dt>
                            <dd className="tnum font-semibold text-navy">{taka(o.deliveryFee)}</dd>
                          </div>
                          <div className="flex justify-between border-t border-paper-deep pt-2">
                            <dt className="font-semibold text-navy">সর্বমোট</dt>
                            <dd className="tnum font-display text-lg font-bold text-wa-deep">{taka(o.total)}</dd>
                          </div>
                        </dl>

                        <div className="mt-4 rounded-xl bg-white p-4 text-sm">
                          <div className="text-ink-soft">ঠিকানা</div>
                          <div className="mt-1 text-navy">{o.address}</div>
                          {o.note ? (
                            <>
                              <div className="mt-3 text-ink-soft">গ্রাহকের নোট</div>
                              <div className="mt-1 text-navy">{o.note}</div>
                            </>
                          ) : null}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <a
                            href={waLink(
                              `আসসালামু আলাইকুম ${o.customerName}, আপনার অর্ডার নং ${o.code} — স্ট্যাটাস: ${ORDER_STATUS[o.status]?.label ?? o.status}`,
                              o.phone.replace(/\D/g, "").replace(/^0/, "880"),
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-wa px-4 py-2 text-sm"
                          >
                            <MessageCircle size={16} /> গ্রাহককে WhatsApp মেসেজ
                          </a>
                          <button onClick={() => remove(o)} className="btn btn-ghost px-4 py-2 text-sm text-alert">
                            <Trash2 size={16} /> অর্ডার মুছুন
                          </button>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-paper-deep bg-white p-5">
                        <h3 className="font-semibold text-navy">স্ট্যাটাস ও লোকেশন আপডেট</h3>
                        <div className="mt-4 space-y-4">
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-navy">স্ট্যাটাস</label>
                            <select
                              className="field"
                              value={d.status}
                              onChange={(e) => setDrafts({ ...drafts, [o.id]: { ...d, status: e.target.value } })}
                            >
                              {ORDER_STATUS_KEYS.map((k) => (
                                <option key={k} value={k}>{ORDER_STATUS[k].label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-navy">বর্তমান লোকেশন</label>
                            <input
                              className="field"
                              value={d.location}
                              placeholder="যেমন: ঢাকা হাব, কুরিয়ার সেন্টার"
                              onChange={(e) => setDrafts({ ...drafts, [o.id]: { ...d, location: e.target.value } })}
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-navy">নোট</label>
                            <textarea
                              className="field min-h-[80px]"
                              value={d.note}
                              placeholder="অর্ডার সম্পর্কে মন্তব্য"
                              onChange={(e) => setDrafts({ ...drafts, [o.id]: { ...d, note: e.target.value } })}
                            />
                          </div>
                          <button
                            onClick={() => save(o)}
                            disabled={savingId === o.id}
                            className="btn btn-navy w-full disabled:opacity-60"
                          >
                            {savingId === o.id ? <Loader2 size={17} className="animate-spin" /> : null}
                            আপডেট সংরক্ষণ করুন
                          </button>
                          <p className="text-xs text-ink-soft">
                            আপডেট করলে গ্রাহক তার মোবাইল নম্বর দিয়ে ট্র্যাকিং পেজে লাইভ স্ট্যাটাস দেখতে পাবেন।
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
