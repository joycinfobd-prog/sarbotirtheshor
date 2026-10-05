"use client";

import Link from "next/link";
import { Heart, MessageCircle, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { useWishlist } from "@/components/Wishlist";
import { taka, waLink } from "@/lib/format";

export type ProductCardData = {
  id: number;
  nameBn: string;
  slug: string;
  price: number;
  oldPrice: number | null;
  image: string | null;
  shortDesc: string | null;
  stock: number;
  isOffer: boolean;
  offerLabel: string | null;
  categoryName?: string | null;
};

export function ProductCard({ product, whatsapp = "8801794608874" }: { product: ProductCardData; whatsapp?: string }) {
  const { add } = useCart();
  const wish = useWishlist();
  const saved = wish.has(product.id);
  const discount = product.oldPrice && product.oldPrice > product.price ? Math.round((product.oldPrice - product.price) / product.oldPrice * 100) : 0;
  const waText = `আসসালামু আলাইকুম, আমি এই পণ্যটি অর্ডার করতে চাই:\n\n*${product.nameBn}*\nমূল্য: ${taka(product.price)}\nলিংক: /product/${product.slug}`;
  return (
    <article className="group flex min-w-0 flex-col overflow-hidden border border-[#ececec] bg-white transition hover:shadow-lg">
      <div className="relative">
        <Link href={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-[#f7f7f7]">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image} alt={product.nameBn} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          ) : <div className="flex h-full items-center justify-center text-sm text-ink-soft">ছবি নেই</div>}
          {discount > 0 && <span className="absolute left-1.5 top-1.5 bg-alert px-1.5 py-0.5 text-[10px] font-semibold text-white sm:left-3 sm:top-3 sm:px-2 sm:py-1 sm:text-xs">-{discount}%</span>}
          {product.isOffer && <span className="absolute bottom-1.5 left-1.5 bg-gold px-1.5 py-0.5 text-[10px] font-semibold text-white sm:bottom-3 sm:left-3 sm:px-2 sm:py-1 sm:text-xs">{product.offerLabel || "অফার"}</span>}
        </Link>
        <button
          type="button"
          onClick={() => wish.toggle(product)}
          aria-label={saved ? "উইশলিস্ট থেকে সরান" : "উইশলিস্টে রাখুন"}
          aria-pressed={saved}
          className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow transition hover:scale-110 sm:right-3 sm:top-3 sm:h-9 sm:w-9"
        >
          <Heart size={17} className={saved ? "fill-alert text-alert" : "text-[#555]"} />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        {product.categoryName && <span className="line-clamp-1 text-[10px] text-ink-soft sm:text-xs">{product.categoryName}</span>}
        <Link href={`/product/${product.slug}`} className="mt-1 line-clamp-2 min-h-[2.7em] text-[13px] font-semibold leading-snug text-ink hover:text-navy sm:text-base">{product.nameBn}</Link>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
          <span className="tnum text-sm font-bold text-navy sm:text-lg">{taka(product.price)}</span>
          {product.oldPrice && product.oldPrice > product.price && <span className="tnum text-[10px] text-ink-soft line-through sm:text-xs">{taka(product.oldPrice)}</span>}
        </div>
        <div className="mt-auto flex gap-1.5 pt-3 sm:gap-2">
          <button type="button" onClick={() => add({ productId: product.id, nameBn: product.nameBn, slug: product.slug, image: product.image, price: product.price, qty: 1 })} className="flex min-h-9 flex-1 items-center justify-center gap-1 bg-navy px-1 text-[11px] font-medium text-white transition hover:bg-navy-deep sm:min-h-10 sm:gap-2 sm:px-2 sm:text-sm"><ShoppingBag size={14} /> কার্টে রাখুন</button>
          <a href={waLink(waText, whatsapp)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp এ অর্ডার" title="WhatsApp এ অর্ডার" className="flex h-9 w-9 shrink-0 items-center justify-center bg-wa text-white transition hover:bg-wa-deep sm:h-10 sm:w-10"><MessageCircle size={17} /></a>
        </div>
      </div>
    </article>
  );
}
