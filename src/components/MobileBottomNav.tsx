"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, House, PackageSearch, Store } from "lucide-react";
import { useWishlist } from "@/components/Wishlist";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { count } = useWishlist();
  if (pathname.startsWith("/admin")) return null;

  const links = [
    { href: "/", label: "হোম", icon: House },
    { href: "/shop", label: "শপ", icon: Store },
    { href: "/wishlist", label: "উইশলিস্ট", icon: Heart, badge: count },
    { href: "/track", label: "অর্ডার ট্র্যাক", icon: PackageSearch },
  ];

  return (
    <nav aria-label="মোবাইল নেভিগেশন" className="fixed inset-x-0 bottom-0 z-50 border-t border-[#e4e4e4] bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_18px_rgba(0,0,0,.07)] md:hidden">
      <div className="grid grid-cols-4">
        {links.map(({ href, label, icon: Icon, badge }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex min-h-[64px] flex-col items-center justify-center gap-1 text-[13px] ${active ? "text-navy" : "text-ink"}`}>
              <span className="relative">
                <Icon size={25} strokeWidth={active ? 2 : 1.5} />
                {badge ? <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-navy px-1 text-[10px] font-bold text-white">{badge}</span> : null}
              </span>
              <span className={active ? "font-semibold" : ""}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
