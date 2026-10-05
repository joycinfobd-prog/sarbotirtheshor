"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useWishlist } from "@/components/Wishlist";

export default function WishlistPage() {
  const { items } = useWishlist();
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10">
      <h1 className="text-center font-display text-3xl font-bold text-ink">উইশলিস্ট</h1>
      <p className="mt-1 text-center text-sm text-ink-soft">আপনার পছন্দের পণ্যগুলো এখানে সংরক্ষিত থাকে</p>
      {items.length === 0 ? (
        <div className="mx-auto mt-10 max-w-md border border-dashed border-paper-deep p-10 text-center">
          <Heart size={40} className="mx-auto text-navy/40" />
          <p className="mt-3 text-ink-soft">উইশলিস্ট খালি। পণ্যের ছবির উপরে ♡ চাপুন।</p>
          <Link href="/shop" className="mt-5 inline-flex bg-navy px-6 py-2.5 text-sm font-medium text-white">পণ্য দেখুন</Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
