"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu, PhoneCall, Search, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { BrandLogo } from "@/components/Logo";

type Cat = { id: number; nameBn: string; slug: string };
type Props = { settings: Record<string, string>; categories: Cat[] };

export function Header({ settings, categories }: Props) {
  const { count } = useCart();
  const pathname = usePathname();
  const [drawer, setDrawer] = useState<null | "cats" | "pages">(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setDrawer(null);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer]);

  if (pathname.startsWith("/admin")) return null;

  const pages = [
    { label: "হোম", href: "/" },
    { label: "সব পণ্য", href: "/shop" },
    { label: "বিশেষ অফার", href: "/offers" },
    { label: "উইশলিস্ট", href: "/wishlist" },
    { label: "অর্ডার ট্র্যাক করুন", href: "/track" },
    { label: "আমাদের সম্পর্কে", href: "/about" },
    { label: "যোগাযোগ", href: "/about#contact" },
  ];
  const tel = (settings.phone || "").replace(/[^\d+]/g, "");

  return (
    <header className="relative z-40 bg-white text-ink">
      {/* সারি ১ — লোগো + কার্ট */}
      <div className="border-b border-[#e6e6e6]">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-4 py-3 sm:py-4">
          <Link href="/" aria-label="হোম" className="flex min-w-0 items-center gap-2.5 sm:gap-4">
            {settings.logo_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.logo_image} alt={settings.store_name} className="h-[68px] w-[68px] shrink-0 object-contain sm:h-[92px] sm:w-[92px]" />
            ) : (
              <BrandLogo className="h-[68px] w-[68px] shrink-0 sm:h-[92px] sm:w-[92px]" />
            )}
            <span className="min-w-0 leading-[1.05]">
              <span className="block font-display text-[1.12rem] font-bold text-navy sm:text-[1.9rem]">{settings.store_name}</span>
              <span className="block font-display text-[1.4rem] font-extrabold text-[#3c3c3c] sm:text-[2.35rem]">{settings.store_name_2}</span>
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-4 sm:gap-6">
            <span className="hidden text-lg text-[#555] sm:inline">
              <span className="text-ink-soft">English</span> <span className="mx-2 text-navy">|</span> <span className="font-medium text-ink">বাংলা</span>
            </span>
            <Link href="/cart" aria-label={`কার্টে ${count} টি পণ্য`} className="relative text-[#444]">
              <ShoppingBag size={32} strokeWidth={1.4} />
              <span className="absolute -right-2.5 -top-2 flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-navy px-1 text-xs font-bold text-white">{count}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* সারি ২ — মেনু, ফোন, সার্চ */}
      <div className="border-b border-[#eeeeee]">
        <div className="mx-auto flex max-w-[1280px] items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => setDrawer("cats")}
            aria-label="ক্যাটাগরি মেনু"
            className="flex h-[50px] w-[62px] shrink-0 items-center justify-center rounded-md bg-navy text-white transition hover:bg-navy-deep lg:w-auto lg:gap-2 lg:px-5"
          >
            <Menu size={30} strokeWidth={1.6} />
            <span className="hidden font-medium lg:inline">সব ক্যাটাগরি</span>
          </button>

          <a href={`tel:${tel}`} className="mx-auto flex items-center gap-3 text-[1.05rem] text-ink sm:text-lg lg:mx-0 lg:ml-4">
            <PhoneCall size={30} strokeWidth={1.4} className="text-navy" />
            <span className="tnum">{settings.phone?.replace(/-/g, "")}</span>
          </a>

          <nav className="ml-6 hidden items-center gap-6 text-[0.95rem] font-medium xl:flex">
            {pages.slice(0, 6).map((p) => (
              <Link key={p.href} href={p.href} className={`transition hover:text-navy ${pathname === p.href ? "text-navy" : ""}`}>
                {p.label}
              </Link>
            ))}
          </nav>

          <form action="/shop" className="ml-auto hidden w-64 items-center border border-[#ddd] lg:flex">
            <input name="q" placeholder="পণ্য খুঁজুন..." className="w-full px-3 py-2.5 text-sm outline-none" />
            <button type="submit" aria-label="খুঁজুন" className="px-3 text-[#444]"><Search size={20} /></button>
          </form>

          <button type="button" onClick={() => setSearchOpen((v) => !v)} aria-label="সার্চ" aria-expanded={searchOpen} className="p-1 text-[#444] lg:hidden">
            <Search size={30} strokeWidth={1.4} />
          </button>
          <button type="button" onClick={() => setDrawer("pages")} aria-label="মেনু" className="flex h-[46px] w-[46px] shrink-0 items-center justify-center border border-[#ccc] text-[#222] xl:hidden">
            <Menu size={28} strokeWidth={2.2} />
          </button>
        </div>
        {searchOpen ? (
          <form action="/shop" className="mx-auto flex max-w-[1280px] gap-2 px-4 pb-3 lg:hidden">
            <input name="q" autoFocus placeholder="পণ্য খুঁজুন..." className="field" />
            <button type="submit" className="bg-navy px-4 text-sm font-medium text-white">খুঁজুন</button>
          </form>
        ) : null}
      </div>

      {/* ড্রয়ার */}
      {drawer ? (
        <div className="fixed inset-0 z-[80]">
          <button aria-label="বন্ধ করুন" className="absolute inset-0 bg-black/45" onClick={() => setDrawer(null)} />
          <aside className={`absolute top-0 flex h-full w-[82%] max-w-[340px] flex-col bg-white shadow-2xl ${drawer === "cats" ? "left-0" : "right-0"}`}>
            <div className="flex items-center justify-between bg-navy px-4 py-4 text-white">
              <span className="font-display text-lg font-bold">{drawer === "cats" ? "সব ক্যাটাগরি" : "মেনু"}</span>
              <button onClick={() => setDrawer(null)} aria-label="বন্ধ"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {(drawer === "cats"
                ? [{ label: "★ বিশেষ অফার", href: "/offers" }, ...categories.map((c) => ({ label: c.nameBn, href: `/shop?category=${c.slug}` }))]
                : pages
              ).map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setDrawer(null)} className="flex items-center justify-between border-b border-[#f0f0f0] px-5 py-3.5 text-[0.98rem] hover:bg-paper hover:text-navy">
                  {item.label}
                  <ChevronRight size={17} className="text-ink-soft" />
                </Link>
              ))}
            </div>
            <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noopener noreferrer" className="m-4 flex items-center justify-center gap-2 bg-wa py-3 font-semibold text-white">
              WhatsApp: {settings.phone}
            </a>
          </aside>
        </div>
      ) : null}
    </header>
  );
}
