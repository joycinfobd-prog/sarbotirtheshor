"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type Slide = {
  image: string;
  title: string;
  title2?: string;
  subtitle?: string;
  badge?: string;
  side?: string;
};

export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), 6500);
    return () => window.clearInterval(id);
  }, [slides.length]);

  if (!slides.length) return null;

  return (
    <section className="relative overflow-hidden bg-navy-deep">
      <div className="relative h-[210px] sm:h-[330px] lg:h-[430px]">
        {slides.map((slide, i) => (
          <div
            key={slide.image + i}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === index ? 1 : 0 }}
            aria-hidden={i !== index}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/75 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/85 via-transparent to-transparent" />

            <div className="absolute inset-0">
              <div className="mx-auto flex h-full max-w-[1280px] items-center px-4">
                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/15 px-3 py-1 text-[0.72rem] font-medium text-gold">
                    ✦ ১০০% অরিজিনাল ও পরিষ্কার মালামাল
                  </div>
                  <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
                    {slide.title}
                    {slide.title2 ? <span className="mt-1 block text-gold">{slide.title2}</span> : null}
                  </h1>
                  {slide.subtitle ? (
                    <p className="mt-3 text-base text-white/80 sm:text-lg">{slide.subtitle}</p>
                  ) : null}
                  {slide.badge ? (
                    <div className="mt-5 inline-block -rotate-1 rounded-md bg-gold px-5 py-2 font-display text-base font-bold text-navy-deep shadow-lg sm:text-lg">
                      {slide.badge}
                    </div>
                  ) : null}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href="/shop" className="btn btn-gold">
                      এখনই কিনুন
                    </Link>
                    <Link href="/offers" className="btn btn-ghost">
                      বিশেষ অফার দেখুন
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white backdrop-blur transition hover:bg-white/30"
        aria-label="আগের স্লাইড"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        onClick={() => setIndex((i) => (i + 1) % slides.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white backdrop-blur transition hover:bg-white/30"
        aria-label="পরের স্লাইড"
      >
        <ChevronRight size={22} />
      </button>

      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-8 bg-gold" : "w-2 bg-white/50"
            }`}
            aria-label={`স্লাইড ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export function OfferCountdown({ deadline }: { deadline: number }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const diff = Math.max(0, deadline - (now ?? deadline));
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  const cells = [
    { v: days, l: "দিন" },
    { v: hours, l: "ঘণ্টা" },
    { v: mins, l: "মিনিট" },
    { v: secs, l: "সেকেন্ড" },
  ];

  return (
    <div className="flex gap-2">
      {cells.map((c) => (
        <div key={c.l} className="min-w-[58px] rounded-xl bg-navy-deep px-3 py-2 text-center text-white">
          <div className="tnum font-display text-xl font-bold leading-none">
            {now === null ? "--" : String(c.v).padStart(2, "0")}
          </div>
          <div className="mt-1 text-[0.62rem] text-white/70">{c.l}</div>
        </div>
      ))}
    </div>
  );
}
