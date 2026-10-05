"use client";

import { useState } from "react";
import { MessageCircle, Minus, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { taka, waLink } from "@/lib/format";

export function ProductActions({
  product,
  whatsapp,
}: {
  product: {
    id: number;
    nameBn: string;
    slug: string;
    price: number;
    image: string | null;
    stock: number;
  };
  whatsapp: string;
}) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  const message = `আসসালামু আলাইকুম, আমি এই পণ্যটি অর্ডার করতে চাই:\n\n*${product.nameBn}*\nপরিমাণ: ${qty}\nমূল্য: ${taka(product.price * qty)}`;

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-ink-soft">পরিমাণ</span>
        <div className="flex items-center gap-2 rounded-xl border border-paper-deep bg-white">
          <button
            type="button"
            className="px-3 py-2 text-navy transition hover:text-gold-deep"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="কমান"
          >
            <Minus size={16} />
          </button>
          <span className="tnum w-8 text-center font-semibold">{qty}</span>
          <button
            type="button"
            className="px-3 py-2 text-navy transition hover:text-gold-deep"
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            aria-label="বাড়ান"
          >
            <Plus size={16} />
          </button>
        </div>
        <span className={`text-sm ${product.stock > 0 ? "text-wa-deep" : "text-alert"}`}>
          {product.stock > 0 ? `স্টকে আছে (${product.stock})` : "স্টকে নেই"}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() =>
            add({
              productId: product.id,
              nameBn: product.nameBn,
              slug: product.slug,
              image: product.image,
              price: product.price,
              qty,
            })
          }
          className="btn btn-navy flex-1"
        >
          <ShoppingCart size={18} /> কার্টে যোগ করুন
        </button>
        <a
          href={waLink(message, whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-wa flex-1"
        >
          <MessageCircle size={18} /> WhatsApp এ অর্ডার
        </a>
      </div>
    </div>
  );
}
