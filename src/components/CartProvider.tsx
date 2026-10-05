"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  productId: number | null;
  nameBn: string;
  slug?: string | null;
  image?: string | null;
  price: number;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  ready: boolean;
  count: number;
  total: number;
  add: (item: CartItem) => void;
  setQty: (index: number, qty: number) => void;
  remove: (index: number) => void;
  clear: () => void;
  toast: string | null;
  showToast: (msg: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "rudra_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
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
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, ready]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  const add = useCallback(
    (item: CartItem) => {
      setItems((prev) => {
        const idx = prev.findIndex(
          (p) => p.productId === item.productId && p.nameBn === item.nameBn,
        );
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], qty: next[idx].qty + item.qty };
          return next;
        }
        return [...prev, item];
      });
      showToast(`“${item.nameBn}” কার্টে যোগ হয়েছে`);
    },
    [showToast],
  );

  const setQty = useCallback((index: number, qty: number) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, qty: Math.max(1, Math.min(99, qty)) } : it)),
    );
  }, []);

  const remove = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((s, it) => s + it.qty, 0), [items]);
  const total = useMemo(() => items.reduce((s, it) => s + it.price * it.qty, 0), [items]);

  return (
    <CartContext.Provider
      value={{ items, ready, count, total, add, setQty, remove, clear, toast, showToast }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
