"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Gem, Globe, Home, Phone, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { BrandLogo } from "@/components/Logo";

export type PosterSlide = {
  image?: string; // admin-uploaded full poster (overrides the drawn one)
  kicker: string;
  title: string;
  title2: string;
  desc: string;
  left: string;
  leftB?: string;
  right: string;
  rightB?: string;
  href: string;
};

/* faint mandala used as poster texture */
export function Mandala({ className = "", stroke = "#1b82c8" }: { className?: string; stroke?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <g fill="none" stroke={stroke} strokeWidth="1.2">
        {Array.from({ length: 16 }).map((_, i) => (
          <path key={i} d="M100 100 C 88 70 88 40 100 12 C 112 40 112 70 100 100 Z" transform={`rotate(${i * 22.5} 100 100)`} />
        ))}
        <circle cx="100" cy="100" r="30" />
        <circle cx="100" cy="100" r="62" strokeDasharray="3 4" />
        <circle cx="100" cy="100" r="92" />
      </g>
    </svg>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center" style={{ gap: "0.5cqw", width: "9.6cqw" }}>
      <span className="flex items-center justify-center rounded-full border border-navy/50 bg-white text-navy" style={{ width: "3.4cqw", height: "3.4cqw" }}>
        {icon}
      </span>
      <span className="text-center leading-tight text-[#3b3b3b]" style={{ fontSize: "0.98cqw" }}>{label}</span>
    </div>
  );
}

function DrawnPoster({ s, settings }: { s: PosterSlide; settings: Record<string, string> }) {
  const ic = { width: "1.9cqw", height: "1.9cqw", strokeWidth: 1.6 } as const;
  return (
    <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(ellipse_at_center,#ffffff_0%,#f3f9fd_45%,#d8ebf8_100%)]">
      {/* texture */}
      <Mandala className="absolute -left-[6%] -top-[40%] w-[30%] opacity-[0.22]" />
      <Mandala className="absolute -bottom-[45%] -right-[5%] w-[32%] opacity-[0.22]" />
      <Mandala className="absolute left-1/2 top-1/2 w-[46%] -translate-x-1/2 -translate-y-1/2 opacity-[0.07]" stroke="#d4a03c" />
      <div className="absolute inset-x-0 top-0 h-[1.6%] bg-gradient-to-r from-gold via-[#f4d68f] to-gold" />
      <div className="absolute inset-x-0 bottom-0 h-[1.6%] bg-gradient-to-r from-gold via-[#f4d68f] to-gold" />

      {/* products — left */}
      <div className="absolute bottom-[4%] left-[1.5%] h-[78%] w-[31%]">
        <div className="absolute bottom-[3%] left-[6%] h-[14%] w-[88%] rounded-[50%] bg-navy/15 blur-[6px]" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={s.left} alt="" className="absolute bottom-[6%] left-0 h-[88%] w-[72%] object-contain mix-blend-multiply" />
        {s.leftB ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.leftB} alt="" className="absolute bottom-[2%] right-0 h-[58%] w-[48%] object-contain mix-blend-multiply" />
        ) : null}
      </div>

      {/* products — right */}
      <div className="absolute bottom-[4%] right-[1.5%] h-[78%] w-[31%]">
        <div className="absolute bottom-[3%] left-[6%] h-[14%] w-[88%] rounded-[50%] bg-navy/15 blur-[6px]" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={s.right} alt="" className="absolute bottom-[6%] right-0 h-[88%] w-[72%] object-contain mix-blend-multiply" />
        {s.rightB ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.rightB} alt="" className="absolute bottom-[2%] left-0 h-[58%] w-[48%] object-contain mix-blend-multiply" />
        ) : null}
      </div>

      {/* centre column */}
      <div className="absolute inset-y-0 left-1/2 flex w-[42%] -translate-x-1/2 flex-col items-center text-center" style={{ paddingTop: "1.6cqw" }}>
        <div className="shrink-0" style={{ width: "5.4cqw", height: "5.4cqw" }}>
          <BrandLogo className="h-full w-full" />
        </div>
        <div className="font-display font-semibold text-navy" style={{ fontSize: "1.4cqw", marginTop: "0.35cqw", lineHeight: 1.1 }}>{s.kicker}</div>
        <div className="font-display font-extrabold text-[#7a4d14]" style={{ fontSize: "3.2cqw", lineHeight: 1.05, marginTop: "0.25cqw", textShadow: "0 1px 0 #fff" }}>{s.title}</div>
        <div className="font-display font-bold text-navy" style={{ fontSize: "2.2cqw", lineHeight: 1.1 }}>{s.title2}</div>
        <div className="flex items-center text-gold" style={{ gap: "0.6cqw", margin: "0.5cqw 0", fontSize: "1cqw" }}>
          <span className="block h-px bg-gold" style={{ width: "6cqw" }} />❖<span className="block h-px bg-gold" style={{ width: "6cqw" }} />
        </div>
        <p className="text-[#444]" style={{ fontSize: "1cqw", lineHeight: 1.35, maxWidth: "32cqw" }}>{s.desc}</p>
        <div className="flex items-start justify-center" style={{ marginTop: "1cqw", gap: "0.3cqw" }}>
          <Feature icon={<Gem style={ic} />} label="১০০% অরিজিনাল" />
          <span className="self-stretch bg-navy/25" style={{ width: 1 }} />
          <Feature icon={<Home style={ic} />} label="নেপাল ও ভারত থেকে সংগৃহীত" />
          <span className="self-stretch bg-navy/25" style={{ width: 1 }} />
          <Feature icon={<Sparkles style={ic} />} label="শুদ্ধ ও পরিষ্কার" />
          <span className="self-stretch bg-navy/25" style={{ width: 1 }} />
          <Feature icon={<ShieldCheck style={ic} />} label="ক্যাশ অন ডেলিভারি" />
          <span className="self-stretch bg-navy/25" style={{ width: 1 }} />
          <Feature icon={<Truck style={ic} />} label="সারা দেশে ডেলিভারি" />
        </div>
      </div>

      {/* contact strip */}
      <div className="absolute left-1/2 flex -translate-x-1/2 items-center whitespace-nowrap rounded-full bg-white/85 text-[#222] shadow-sm" style={{ bottom: "2.6%", gap: "1.4cqw", padding: "0.45cqw 1.6cqw", fontSize: "1.05cqw" }}>
        <span className="flex items-center" style={{ gap: "0.5cqw" }}>
          <span className="flex items-center justify-center rounded-full bg-navy text-white" style={{ width: "1.7cqw", height: "1.7cqw" }}><Phone style={{ width: "1cqw", height: "1cqw" }} /></span>
          <span className="tnum font-semibold">{settings.phone}</span>
        </span>
        <span className="bg-[#bbb]" style={{ width: 1, height: "1.6cqw" }} />
        <span className="flex items-center" style={{ gap: "0.5cqw" }}>
          <span className="flex items-center justify-center rounded-full bg-wa text-white" style={{ width: "1.7cqw", height: "1.7cqw", fontSize: "0.9cqw" }}>✆</span>
          <span className="font-semibold">WhatsApp অর্ডার</span>
        </span>
        <span className="bg-[#bbb]" style={{ width: 1, height: "1.6cqw" }} />
        <span className="flex items-center" style={{ gap: "0.5cqw" }}>
          <Globe style={{ width: "1.5cqw", height: "1.5cqw" }} className="text-navy" />
          <span className="font-semibold">হোম ডেলিভারি সারা বাংলাদেশে</span>
        </span>
      </div>
    </div>
  );
}

export function BannerPoster({ slides, settings }: { slides: PosterSlide[]; settings: Record<string, string> }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (slides.length < 2) return;
    const t = window.setInterval(() => setI((v) => (v + 1) % slides.length), 6000);
    return () => window.clearInterval(t);
  }, [slides.length]);
  if (!slides.length) return null;

  return (
    <section aria-label="ব্যানার" className="relative w-full overflow-hidden bg-white" style={{ containerType: "inline-size" }}>
      <div className="relative w-full" style={{ aspectRatio: "925 / 340" }}>
        {slides.map((s, idx) => (
          <Link
            key={idx}
            href={s.href}
            aria-hidden={idx !== i}
            tabIndex={idx === i ? 0 : -1}
            className="absolute inset-0 block transition-opacity duration-700"
            style={{ opacity: idx === i ? 1 : 0, pointerEvents: idx === i ? "auto" : "none" }}
          >
            {s.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.image} alt={s.title} className="h-full w-full object-cover" />
            ) : (
              <DrawnPoster s={s} settings={settings} />
            )}
          </Link>
        ))}
      </div>

      <button type="button" aria-label="আগের ব্যানার" onClick={() => setI((v) => (v - 1 + slides.length) % slides.length)} className="absolute left-[2%] top-1/2 -translate-y-1/2 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,.55)] transition hover:scale-110">
        <ChevronLeft strokeWidth={1.2} style={{ width: "max(28px,4.4cqw)", height: "max(28px,4.4cqw)" }} />
      </button>
      <button type="button" aria-label="পরের ব্যানার" onClick={() => setI((v) => (v + 1) % slides.length)} className="absolute right-[2%] top-1/2 -translate-y-1/2 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,.55)] transition hover:scale-110">
        <ChevronRight strokeWidth={1.2} style={{ width: "max(28px,4.4cqw)", height: "max(28px,4.4cqw)" }} />
      </button>
    </section>
  );
}
