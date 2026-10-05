"use client";

import Link from "next/link";
import { useRef } from "react";
import { Check, ChevronLeft, ChevronRight, Phone } from "lucide-react";
import { BrandLogo } from "@/components/Logo";
import { Mandala } from "@/components/BannerPoster";

type Cat = { id: number; nameBn: string; slug: string; image: string | null; description: string | null };

const FALLBACK: Record<string, string> = {
  rudraksha: "/images/p-mala.jpg",
  "puja-samagri": "/images/p-puja-thali.jpg",
  "brass-bracelet": "/images/p-bracelet.jpg",
  "brass-samagri": "/images/p-kalash.jpg",
  "rudraksha-bracelet": "/images/p-bracelet.jpg",
  "rudraksha-mala": "/images/p-mala.jpg",
  others: "/images/p-lingam.jpg",
};

function CategoryPoster({ c, phone, store }: { c: Cat; phone: string; store: string }) {
  const img = c.image || FALLBACK[c.slug] || "/images/p-mala.jpg";
  return (
    <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(ellipse_at_60%_45%,#ffffff_0%,#eef7fc_55%,#d5e9f6_100%)]" style={{ containerType: "inline-size" }}>
      <Mandala className="absolute -left-[14%] -top-[22%] w-[46%] opacity-25" />
      <Mandala className="absolute -bottom-[30%] -right-[12%] w-[52%] opacity-25" />
      <div className="absolute inset-[3%] border border-gold/45" />

      {/* left column: brand + contact */}
      <div className="absolute left-[7%] top-[9%] flex flex-col" style={{ gap: "1.4cqw" }}>
        <div style={{ width: "13cqw", height: "13cqw" }}>
          <BrandLogo className="h-full w-full" />
        </div>
        <span className="font-display font-bold leading-tight text-navy" style={{ fontSize: "3.1cqw", maxWidth: "26cqw" }}>{store}</span>
        <span className="flex items-center text-[#333]" style={{ gap: "1cqw", fontSize: "2.5cqw" }}>
          <Phone style={{ width: "2.6cqw", height: "2.6cqw" }} className="text-navy" />
          <span className="tnum">{phone}</span>
        </span>
      </div>

      {/* heading */}
      <div className="absolute right-[6%] top-[9%] text-right" style={{ maxWidth: "52cqw" }}>
        <div className="font-display font-extrabold leading-none text-[#7a4d14]" style={{ fontSize: "7cqw" }}>{c.nameBn}</div>
        <div className="ml-auto mt-[1.2cqw] h-px bg-gold" style={{ width: "24cqw" }} />
        <ul className="mt-[1.6cqw] space-y-[0.9cqw] text-[#444]" style={{ fontSize: "2.5cqw" }}>
          {["১০০% অরিজিনাল", "শুদ্ধ ও পরিষ্কার"].map((t) => (
            <li key={t} className="flex items-center justify-end" style={{ gap: "1cqw" }}>
              {t}
              <span className="flex items-center justify-center rounded-full border border-navy/50 text-navy" style={{ width: "3.4cqw", height: "3.4cqw" }}>
                <Check style={{ width: "2.2cqw", height: "2.2cqw" }} />
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* product on podium */}
      <div className="absolute bottom-[6%] left-[22%] h-[12%] w-[62%] rounded-[50%] bg-gradient-to-b from-white to-[#dfe9f1] shadow-[0_6px_14px_rgba(12,100,164,.18)]" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img} alt={c.nameBn} className="absolute bottom-[10%] left-[24%] h-[56%] w-[58%] object-contain mix-blend-multiply transition duration-500 group-hover:scale-105" />
    </div>
  );
}

export function CategoryCarousel({ categories, phone, store }: { categories: Cat[]; phone: string; store: string }) {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-6 pt-10 sm:pt-14">
      <h2 className="text-center font-display text-[2rem] font-bold text-[#333] sm:text-[2.6rem]">টপ ক্যাটাগরি</h2>
      <div className="relative mt-8 sm:mt-10">
        <div ref={track} className="scroll-row flex snap-x snap-mandatory gap-[6%] overflow-x-auto sm:gap-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/shop?category=${c.slug}`}
              className="group block w-[47%] shrink-0 snap-start text-center sm:w-[calc((100%-48px)/3)] lg:w-[calc((100%-72px)/4)]"
            >
              <div className="aspect-[400/265] w-full overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.08)]">
                <CategoryPoster c={c} phone={phone} store={store} />
              </div>
              <div className="mt-4 font-display text-[1.1rem] text-[#333] transition group-hover:text-navy sm:text-xl">{c.nameBn}</div>
            </Link>
          ))}
        </div>
        <button type="button" onClick={() => scroll(-1)} aria-label="আগের ক্যাটাগরি" className="absolute left-[10%] top-[calc((47vw-1.3rem)*0.33)] flex h-11 w-11 items-center justify-center rounded-lg bg-white text-[#222] shadow-md sm:left-2 sm:top-[22%]">
          <ChevronLeft size={26} strokeWidth={1.5} />
        </button>
        <button type="button" onClick={() => scroll(1)} aria-label="পরের ক্যাটাগরি" className="absolute right-[10%] top-[calc((47vw-1.3rem)*0.33)] flex h-11 w-11 items-center justify-center rounded-lg bg-white text-[#222] shadow-md sm:right-2 sm:top-[22%]">
          <ChevronRight size={26} strokeWidth={1.5} />
        </button>
      </div>
    </section>
  );
}
