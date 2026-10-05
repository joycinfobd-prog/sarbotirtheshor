import Link from "next/link";
import { BadgeCheck, Headphones, ShieldCheck, Truck } from "lucide-react";
import { OfferCountdown } from "@/components/Hero";
import { BannerPoster, type PosterSlide } from "@/components/BannerPoster";
import { CategoryCarousel } from "@/components/CategoryCarousel";
import { HomeProducts } from "@/components/HomeProducts";
import { ProductCard } from "@/components/ProductCard";
import { getCategories, getProducts, getReviews, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";


export default async function HomePage() {
  const [settings, categories, products, reviews] = await Promise.all([
    getSettings(), getCategories(), getProducts({}), getReviews(),
  ]);
  const offers = products.filter(p => p.isOffer).slice(0, 4);
  const catName = (id: number | null) => id ? categories.find(c => c.id === id)?.nameBn ?? null : null;
  const cards = products.map(p => ({
    id: p.id, nameBn: p.nameBn, slug: p.slug, price: p.price, oldPrice: p.oldPrice,
    image: p.image, shortDesc: p.shortDesc, stock: p.stock, isOffer: p.isOffer,
    offerLabel: p.offerLabel, categoryName: catName(p.categoryId), soldCount: p.soldCount, createdAt: p.createdAt,
  }));
  const slides: PosterSlide[] = [
    {
      image: settings.banner_image_1 || undefined,
      kicker: settings.hero_subtitle || "প্রকৃতির শক্তি, ভক্তির সাথে",
      title: settings.hero_title_2 || "অরিজিনাল রুদ্রাক্ষ",
      title2: "মালা, ব্রেসলেট ও রুদ্রাক্ষ",
      desc: "নেপাল ও ভারত থেকে সংগৃহীত, হাতে বাছাই করা পরিষ্কার রুদ্রাক্ষ — আমাদের বিশ্বাস, আমাদের ঐতিহ্য।",
      left: "/images/p-mala.jpg",
      leftB: "/images/p-bracelet.jpg",
      right: "/images/p-lingam.jpg",
      rightB: "/images/p-mala.jpg",
      href: "/shop?category=rudraksha",
    },
    {
      image: settings.banner_image_2 || undefined,
      kicker: "ঘরের পূজার সব আয়োজন",
      title: "পূজা সামগ্রী",
      title2: "ও পিতলের সামগ্রী",
      desc: "পিতলের থালি, কলস, ঘণ্টা, দীপ ও কূর্ম দেব — দক্ষ কারিগরের হাতে তৈরি টেকসই সামগ্রী।",
      left: "/images/p-puja-thali.jpg",
      leftB: "/images/p-brass-turtle.jpg",
      right: "/images/p-kalash.jpg",
      rightB: "/images/p-puja-thali.jpg",
      href: "/shop?category=puja-samagri",
    },
    {
      image: settings.banner_image_3 || undefined,
      kicker: settings.offer_title || "বিশেষ অফার চলছে",
      title: "বিশেষ ছাড়",
      title2: "নির্বাচিত পণ্যে",
      desc: settings.offer_subtitle || "সীমিত সময়ের জন্য নির্বাচিত পণ্যে বিশেষ ছাড় — আজই অর্ডার করুন।",
      left: "/images/p-bracelet.jpg",
      leftB: "/images/p-brass-turtle.jpg",
      right: "/images/p-mala.jpg",
      rightB: "/images/p-kalash.jpg",
      href: "/offers",
    },
  ];
  const offerDeadline = settings.offer_end ? new Date(settings.offer_end).getTime() : Date.now() + 3 * 24 * 60 * 60 * 1000;

  return <div>
    {/* Reference-style special offer announcement, above banner and categories */}
    <div className="mx-auto flex max-w-[1280px] items-start px-4 pb-2 pt-4">
      <Link href="/offers" className="flex h-[54px] w-[68px] shrink-0 items-center rounded-[3px] bg-navy px-2 font-display text-[1.02rem] font-bold leading-[1.15] text-white sm:h-[46px] sm:w-auto sm:px-5 sm:text-lg">বিশেষ<br className="sm:hidden" /> অফার</Link>
      <div className="flex h-[34px] min-w-0 flex-1 items-center overflow-hidden border border-navy px-3 text-[0.82rem] text-[#333] sm:h-[46px] sm:px-5 sm:text-base">
        <div className="marquee-track"><span>✦ {settings.offer_subtitle} &nbsp; · &nbsp; ১০০% অরিজিনাল রুদ্রাক্ষ &nbsp; · &nbsp; সারা বাংলাদেশে হোম ডেলিভারি &nbsp; ✦</span><span>✦ {settings.offer_subtitle} &nbsp; · &nbsp; ১০০% অরিজিনাল রুদ্রাক্ষ &nbsp; · &nbsp; সারা বাংলাদেশে হোম ডেলিভারি &nbsp; ✦</span></div>
      </div>
    </div>

    <BannerPoster slides={slides} settings={settings} />

    <CategoryCarousel categories={categories} phone={settings.phone} store={settings.store_name} />

    {offers.length > 0 && <section className="border-y border-paper-deep bg-[#f5f9fc] py-10 sm:py-14">
      <div className="mx-auto max-w-[1280px] px-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-deep">সীমিত সময়ের জন্য</span><h2 className="mt-1 font-display text-[1.8rem] font-bold text-ink sm:text-4xl">{settings.offer_title}</h2><p className="mt-1 text-sm text-ink-soft">{settings.offer_subtitle}</p></div>
          <OfferCountdown deadline={offerDeadline} />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-4">
          {offers.map(p => <ProductCard key={p.id} whatsapp={settings.whatsapp} product={{ id: p.id, nameBn: p.nameBn, slug: p.slug, price: p.price, oldPrice: p.oldPrice, image: p.image, shortDesc: p.shortDesc, stock: p.stock, isOffer: p.isOffer, offerLabel: p.offerLabel, categoryName: catName(p.categoryId) }} />)}
        </div>
        <div className="mt-7 text-center"><Link href="/offers" className="inline-flex border border-navy px-8 py-2.5 font-medium text-navy hover:bg-navy hover:text-white">সব অফার দেখুন →</Link></div>
      </div>
    </section>}

    <HomeProducts products={cards} whatsapp={settings.whatsapp} />

    <section className="mx-auto grid max-w-[1280px] gap-6 px-4 py-12 lg:grid-cols-[1.15fr_1fr]">
      <div className="overflow-hidden border border-paper-deep bg-white">
        <div className="grid sm:grid-cols-[1fr_1.1fr]">
          <div className="relative min-h-[210px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={settings.about_image || "/images/about-temple.jpg"} alt="আমাদের সম্পর্কে" className="h-full w-full object-cover" />
          </div>
          <div className="bg-navy p-6 text-white sm:p-7"><h2 className="font-display text-2xl font-bold text-white">{settings.about_title}</h2><div className="gold-rule mt-2 w-20" /><p className="mt-4 text-sm leading-relaxed text-white/85">{settings.about_text}</p><Link href="/about" className="mt-5 inline-flex bg-white px-5 py-2 text-sm font-semibold text-navy">বিস্তারিত জানুন →</Link></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {[
          { icon: <ShieldCheck size={25} />, title: "১০০% অরিজিনাল", sub: "প্রতিটি পণ্যের নিশ্চয়তা" },
          { icon: <Truck size={25} />, title: "সারা বাংলাদেশে ডেলিভারি", sub: "দ্রুত ও নিরাপদ পরিবহন" },
          { icon: <BadgeCheck size={25} />, title: "ক্যাশ অন ডেলিভারি", sub: "হাতে পেয়ে পেমেন্ট" },
          { icon: <Headphones size={25} />, title: "সরাসরি সাপোর্ট", sub: "হোয়াটসঅ্যাপে কথা বলুন" },
        ].map(f => <div key={f.title} className="border border-paper-deep bg-white p-4 sm:p-6"><div className="text-navy">{f.icon}</div><h3 className="mt-3 font-display text-sm font-bold text-ink sm:text-lg">{f.title}</h3><p className="mt-1 text-xs text-ink-soft sm:text-sm">{f.sub}</p></div>)}
      </div>
    </section>

    {reviews.length > 0 && <section className="mx-auto max-w-[1280px] px-4 pb-14">
      <h2 className="text-center font-display text-[1.8rem] font-bold text-ink sm:text-4xl">গ্রাহক মতামত</h2>
      <div className="mt-7 grid gap-4 md:grid-cols-3">{reviews.slice(0, 3).map(r => <figure key={r.id} className="border border-paper-deep bg-white p-6"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-navy font-display text-lg text-white">{r.name.slice(0, 1)}</div><div><figcaption className="font-semibold text-ink">{r.name}</figcaption><div className="text-xs text-ink-soft">{r.role}</div></div></div><div className="mt-3 text-gold">{"★".repeat(r.rating)}</div><blockquote className="mt-2 text-sm leading-relaxed text-ink-soft">“{r.text}”</blockquote></figure>)}</div>
    </section>}
  </div>;
}
