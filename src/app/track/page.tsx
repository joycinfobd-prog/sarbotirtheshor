"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, MapPin, MessageCircle, PackageSearch, Search } from "lucide-react";
import { ORDER_STATUS } from "@/lib/site";
import { taka, waLink } from "@/lib/format";

type TrackedOrder = {
  id: number;
  code: string;
  customerName: string;
  phone: string;
  address: string;
  status: string;
  location: string | null;
  total: number;
  createdAt: string;
  items: { nameBn: string; qty: number; price: number }[];
  events: { id: number; status: string; location: string | null; note: string | null; createdAt: string }[];
};

function TrackClient() {
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("phone") ?? params.get("code") ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<TrackedOrder[] | null>(null);
  const [whatsapp, setWhatsapp] = useState("8801794608874");

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    if (!value.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/track?phone=${encodeURIComponent(value)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "খুঁজে পাওয়া যায়নি।");
      setOrders(data.orders);
      if (data.orders.length === 0) setError("এই নম্বরে কোনো অর্ডার পাওয়া যায়নি।");
    } catch (err) {
      setError(err instanceof Error ? err.message : "কিছু ভুল হয়েছে।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[900px] px-4 py-12">
      <div className="rounded-2xl border border-paper-deep bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-gold">
            <PackageSearch size={24} />
          </div>
          <div>
            <h1 className="section-title text-2xl text-navy sm:text-3xl">অর্ডার ট্র্যাকিং</h1>
            <p className="text-sm text-ink-soft">মোবাইল নম্বর বা অর্ডার নম্বর দিয়ে আপনার অর্ডারের অবস্থান জানুন</p>
          </div>
        </div>

        <form onSubmit={search} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            className="field flex-1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="মোবাইল নম্বর অথবা অর্ডার নং লিখুন"
            aria-label="মোবাইল নম্বর বা অর্ডার নং"
          />
          <button type="submit" className="btn btn-navy" disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            ট্র্যাক করুন
          </button>
        </form>

        {error ? (
          <div className="mt-5 rounded-xl border border-alert/30 bg-alert/10 px-4 py-3 text-sm text-alert">{error}</div>
        ) : null}
      </div>

      {orders?.map((order) => {
        const tone = ORDER_STATUS[order.status] ?? ORDER_STATUS.pending;
        return (
          <div key={order.id} className="mt-6 rounded-2xl border border-paper-deep bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-ink-soft">অর্ডার নং</div>
                <div className="tnum font-display text-xl font-bold text-navy">{order.code}</div>
                <div className="mt-1 text-sm text-ink-soft">
                  {order.customerName} · <span className="tnum">{order.phone}</span>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${tone.tone}`}>
                  {tone.label}
                </span>
                <div className="tnum mt-2 font-display text-lg font-bold text-wa-deep">{taka(order.total)}</div>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-paper p-4 text-sm">
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <div>
                  <span className="text-ink-soft">পণ্য: </span>
                  {order.items.map((it) => `${it.nameBn} × ${it.qty}`).join(", ")}
                </div>
                <div>
                  <span className="text-ink-soft">ঠিকানা: </span>
                  {order.address}
                </div>
                <div>
                  <span className="text-ink-soft">তারিখ: </span>
                  <span className="tnum">{new Date(order.createdAt).toLocaleDateString("bn-BD")}</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="flex items-center gap-2 font-semibold text-navy">
                <MapPin size={17} className="text-gold-deep" /> লাইভ স্ট্যাটাস
              </h3>
              <ol className="mt-4 space-y-0">
                {order.events.map((ev, idx) => {
                  const evTone = ORDER_STATUS[ev.status] ?? ORDER_STATUS.pending;
                  return (
                    <li key={ev.id} className="relative flex gap-4 pb-6 last:pb-0">
                      {idx !== order.events.length - 1 ? (
                        <span className="absolute left-[9px] top-5 h-full w-0.5 bg-paper-deep" />
                      ) : null}
                      <span className="relative z-10 mt-1 h-[18px] w-[18px] shrink-0 rounded-full border-4 border-white bg-navy-mid shadow" />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold ${evTone.tone}`}>
                            {evTone.label}
                          </span>
                          <span className="tnum text-xs text-ink-soft">
                            {new Date(ev.createdAt).toLocaleString("bn-BD")}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-navy">
                          {ev.location || "লোকেশন আপডেট হয়নি"}
                        </div>
                        {ev.note ? <div className="text-xs text-ink-soft">{ev.note}</div> : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            <a
              href={waLink(
                `আসসালামু আলাইকুম, আমার অর্ডার নং ${order.code} এর আপডেট জানতে চাই।`,
                whatsapp,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-wa mt-5 w-full sm:w-auto"
            >
              <MessageCircle size={17} /> WhatsApp এ যোগাযোগ করুন
            </a>
          </div>
        );
      })}

      <div className="mt-8 rounded-2xl border border-paper-deep bg-white p-6">
        <h3 className="font-semibold text-navy">WhatsApp নম্বর</h3>
        <p className="mt-1 text-sm text-ink-soft">
          অর্ডার সংক্রান্ত সরাসরি কথা বলতে এই নম্বরে মেসেজ করুন।
        </p>
        <input
          className="field mt-3 max-w-xs"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          aria-label="WhatsApp নম্বর"
        />
      </div>

      <div className="mt-8 text-center">
        <Link href="/shop" className="btn btn-ghost">← কেনাকাটা চালিয়ে যান</Link>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[900px] px-4 py-12 text-ink-soft">লোড হচ্ছে...</div>}>
      <TrackClient />
    </Suspense>
  );
}
