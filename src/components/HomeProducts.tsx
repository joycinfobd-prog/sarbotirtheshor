"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";

type Product = ProductCardData & { soldCount: number; createdAt: Date | string };

export function HomeProducts({ products, whatsapp }: { products: Product[]; whatsapp: string }) {
  const [tab, setTab] = useState<"new" | "best" | "forYou">("new");
  const tabs = [
    { key: "new", label: "নতুন পণ্য" },
    { key: "best", label: "বেস্ট সেলার" },
    { key: "forYou", label: "আপনার জন্য" },
  ] as const;
  const sorted = [...products].sort((a, b) => {
    if (tab === "best") return b.soldCount - a.soldCount;
    if (tab === "forYou") return Number(b.isOffer) - Number(a.isOffer) || a.price - b.price;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }).slice(0, 8);

  return <section className="mx-auto max-w-[1280px] px-4 py-12 md:py-16">
    <h2 className="text-center font-display text-[2rem] font-bold text-[#333] sm:text-[2.6rem]">এক্সক্লুসিভ পণ্য</h2>
    <div className="mx-auto mt-6 flex max-w-xl justify-center gap-4 text-[1.05rem] sm:gap-8 sm:text-lg">
      {tabs.map(t => <button key={t.key} type="button" onClick={() => setTab(t.key)} className={`border-b-2 px-1 pb-2 transition ${tab === t.key ? "border-navy font-medium text-navy" : "border-transparent text-[#444] hover:text-navy"}`}>{t.label}</button>)}
    </div>
    <div className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-4">
      {sorted.map(p => <ProductCard key={p.id} product={p} whatsapp={whatsapp} />)}
    </div>
    {sorted.length === 0 && <p className="py-12 text-center text-ink-soft">এখনও কোনো পণ্য যোগ করা হয়নি।</p>}
    <div className="mt-9 text-center"><Link href="/shop" className="inline-flex border border-navy px-8 py-2.5 font-medium text-navy transition hover:bg-navy hover:text-white">সব পণ্য দেখুন →</Link></div>
  </section>;
}
