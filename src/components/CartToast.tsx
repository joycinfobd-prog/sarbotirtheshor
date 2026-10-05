"use client";

import { useCart } from "@/components/CartProvider";

export function CartToast() {
  const { toast } = useCart();
  if (!toast) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
      <div className="toast-in flex items-center gap-3 rounded-xl bg-navy px-5 py-3 text-sm font-medium text-white shadow-2xl">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-wa text-[#05321a]">✓</span>
        {toast}
      </div>
    </div>
  );
}
