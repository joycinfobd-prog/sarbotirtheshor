"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ProductCardData } from "@/components/ProductCard";

type WishCtx = {
  items: ProductCardData[];
  count: number;
  has: (id: number) => boolean;
  toggle: (p: ProductCardData) => void;
  remove: (id: number) => void;
};

const Ctx = createContext<WishCtx | null>(null);
const KEY = "rudra_wish_v1";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ProductCardData[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, ready]);

  const has = useCallback((id: number) => items.some((i) => i.id === id), [items]);
  const toggle = useCallback((p: ProductCardData) => {
    setItems((prev) => (prev.some((i) => i.id === p.id) ? prev.filter((i) => i.id !== p.id) : [...prev, p]));
  }, []);
  const remove = useCallback((id: number) => setItems((prev) => prev.filter((i) => i.id !== id)), []);

  return <Ctx.Provider value={{ items, count: items.length, has, toggle, remove }}>{children}</Ctx.Provider>;
}

export function useWishlist() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useWishlist must be used inside WishlistProvider");
  return c;
}
