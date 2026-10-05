"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Mail, MapPin, Phone } from "lucide-react";

function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.63c-.29-.04-1.27-.13-2.4-.13-2.38 0-4.01 1.45-4.01 4.12V9.9H7.6V13h2.69v8h3.21Z" />
    </svg>
  );
}

function YoutubeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.28 5 12 5 12 5s-6.28 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.72 19 12 19 12 19s6.28 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15.2V8.8L15.5 12 10 15.2Z" />
    </svg>
  );
}
import { Wordmark } from "@/components/Logo";
import { useCart } from "@/components/CartProvider";

export function Footer({
  settings,
  categories,
}: {
  settings: Record<string, string>;
  categories: { id: number; nameBn: string; slug: string }[];
}) {
  const { showToast } = useCart();
  const pathname = usePathname();
  const [email, setEmail] = useState("");

  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="mt-16 bg-navy-deep text-white/85">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Wordmark
            name={settings.store_name}
            name2={settings.store_name_2}
            tagline={settings.store_tagline}
            dark
            logoImage={settings.logo_image || undefined}
          />
          <p className="mt-4 max-w-xs text-[0.85rem] leading-relaxed text-white/70">
            {settings.about_text}
          </p>
          <div className="mt-4 flex gap-3">
            <a href={settings.facebook} target="_blank" rel="noopener noreferrer" aria-label="ফেসবুক" className="rounded-full bg-white/10 p-2 transition hover:bg-gold hover:text-navy-deep">
              <FacebookIcon size={18} />
            </a>
            <a href={settings.youtube} target="_blank" rel="noopener noreferrer" aria-label="ইউটিউব" className="rounded-full bg-white/10 p-2 transition hover:bg-gold hover:text-navy-deep">
              <YoutubeIcon size={18} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-display text-lg font-bold text-gold">গুরুত্বপূর্ণ লিংক</h4>
          <div className="gold-rule mt-2 w-16" />
          <ul className="mt-4 space-y-2.5 text-[0.88rem]">
            <li><Link href="/" className="transition hover:text-gold">হোম</Link></li>
            <li><Link href="/shop" className="transition hover:text-gold">সব পণ্য</Link></li>
            <li><Link href="/offers" className="transition hover:text-gold">বিশেষ অফার</Link></li>
            <li><Link href="/track" className="transition hover:text-gold">অর্ডার ট্র্যাকিং</Link></li>
            <li><Link href="/about" className="transition hover:text-gold">আমাদের সম্পর্কে</Link></li>
            <li><Link href="/cart" className="transition hover:text-gold">শপিং কার্ট</Link></li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.slice(0, 4).map((c) => (
              <Link key={c.id} href={`/shop?category=${c.slug}`} className="rounded-full bg-white/10 px-3 py-1 text-[0.72rem] transition hover:bg-gold hover:text-navy-deep">
                {c.nameBn}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display text-lg font-bold text-gold">যোগাযোগ</h4>
          <div className="gold-rule mt-2 w-16" />
          <ul className="mt-4 space-y-3 text-[0.88rem]">
            <li className="flex gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-gold" />
              <span>সরবরাহ ঘর: {settings.address}</span>
            </li>
            <li className="flex gap-3">
              <Phone size={18} className="mt-0.5 shrink-0 text-gold" />
              <span>
                <a href={`tel:${settings.phone}`} className="tnum transition hover:text-gold">{settings.phone}</a>
                <br />
                <a href={`tel:${settings.phone_2}`} className="tnum transition hover:text-gold">{settings.phone_2}</a>
              </span>
            </li>
            <li className="flex gap-3">
              <Mail size={18} className="mt-0.5 shrink-0 text-gold" />
              <a href={`mailto:${settings.email}`} className="break-all transition hover:text-gold">{settings.email}</a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg font-bold text-gold">নিউজলেটার</h4>
          <div className="gold-rule mt-2 w-16" />
          <p className="mt-4 text-[0.85rem] text-white/70">
            নতুন পণ্য ও বিশেষ অফারের খবর পেতে সাবস্ক্রাইব করুন।
          </p>
          <form
            className="mt-4 flex overflow-hidden rounded-lg"
            onSubmit={(e) => {
              e.preventDefault();
              showToast("ধন্যবাদ! আপনার সাবস্ক্রিপশন গ্রহণ করা হয়েছে।");
              setEmail("");
            }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="আপনার ইমেইল লিখুন"
              className="w-full bg-white px-3 py-2.5 text-sm text-ink outline-none"
            />
            <button type="submit" className="bg-gold px-4 text-navy-deep transition hover:bg-[#ffbb1f]" aria-label="সাবস্ক্রাইব">
              ➤
            </button>
          </form>
          <div className="mt-4 rounded-xl bg-white/5 p-4 text-[0.8rem]">
            <div className="text-white/60">ক্যাশ অন ডেলিভারি চার্জ</div>
            <div className="tnum mt-1 text-gold">
              ঢাকায় ৳৬০ · ঢাকার বাইরে ৳১২০ · ৳{Number(settings.free_delivery_min || 5000).toLocaleString("en-US")}+ অর্ডারে ফ্রি
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-2 px-4 py-4 text-[0.76rem] text-white/60 sm:flex-row">
          <div>{settings.footer_note}</div>
          <div className="flex items-center gap-3">
            <Link href="/about" className="hover:text-gold">শর্তাবলী</Link>
            <Link href="/about" className="hover:text-gold">গোপনীয়তা নীতি</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
