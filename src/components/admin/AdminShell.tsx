"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Menu,
  Package,
  Settings,
  X,
} from "lucide-react";
import { LogoMark } from "@/components/Logo";

const NAV = [
  { href: "/admin", label: "ড্যাশবোর্ড", icon: <LayoutDashboard size={18} /> },
  { href: "/admin/products", label: "পণ্যসমূহ", icon: <Package size={18} /> },
  { href: "/admin/categories", label: "ক্যাটাগরি", icon: <LayoutGrid size={18} /> },
  { href: "/admin/orders", label: "অর্ডারসমূহ", icon: <ClipboardList size={18} /> },
  { href: "/admin/settings", label: "সেটিংস ও ব্যবহারকারী", icon: <Settings size={18} /> },
];

export function AdminShell({
  user,
  children,
}: {
  user: { id: number; name: string; phone: string; role: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto flex max-w-[1400px]">
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-navy-deep text-white transition-transform duration-300 lg:static lg:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
            <LogoMark className="h-11 w-11" ring="#ffffff" />
            <div>
              <div className="font-display text-base font-bold leading-tight">রুদ্রাক্ষ ভান্ডার</div>
              <div className="text-[0.7rem] text-white/60">অ্যাডমিন প্যানেল</div>
            </div>
            <button className="ml-auto lg:hidden" onClick={() => setOpen(false)} aria-label="বন্ধ">
              <X size={20} />
            </button>
          </div>

          <nav className="p-4">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                    active ? "bg-gold font-semibold text-navy-deep" : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}

            <Link
              href="/"
              className="mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/80 transition hover:bg-white/10"
            >
              <ExternalLink size={18} /> ওয়েবসাইট দেখুন
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/80 transition hover:bg-alert/30"
            >
              <LogOut size={18} /> লগআউট
            </button>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 px-5 py-4 text-xs text-white/60">
            <div className="font-semibold text-white">{user.name}</div>
            <div className="tnum">{user.phone}</div>
            <div className="mt-1 inline-block rounded-full bg-white/10 px-2 py-0.5">
              {user.role === "owner" ? "মালিক" : "অ্যাডমিন"}
            </div>
          </div>
        </aside>

        {open ? (
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />
        ) : null}

        <div className="flex-1">
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-paper-deep bg-white px-4 py-3">
            <button className="rounded-lg border border-paper-deep p-2 text-navy lg:hidden" onClick={() => setOpen(true)} aria-label="মেনু">
              <Menu size={20} />
            </button>
            <div className="font-display text-lg font-bold text-navy">সর্বতীর্থেশ্বর মহাদেব রুদ্রাক্ষ ভান্ডার</div>
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden rounded-full bg-wa/15 px-3 py-1 text-xs font-semibold text-wa-deep sm:inline">
                ● লাইভ স্টোর
              </span>
              <button onClick={logout} className="btn btn-ghost px-3 py-2 text-xs">
                লগআউট
              </button>
            </div>
          </header>
          <div className="p-4 sm:p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
