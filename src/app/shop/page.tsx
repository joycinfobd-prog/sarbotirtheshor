import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/ProductCard";
import { getCategories, getProducts, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ category?: string; q?: string }>;

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const [settings, categories, allProducts] = await Promise.all([
    getSettings(),
    getCategories(),
    getProducts({}),
  ]);

  const activeCat = categories.find((c) => c.slug === params.category);
  const query = (params.q ?? "").trim().toLowerCase();

  let list = allProducts;
  if (activeCat) list = list.filter((p) => p.categoryId === activeCat.id);
  if (query) {
    list = list.filter(
      (p) =>
        p.nameBn.toLowerCase().includes(query) ||
        (p.shortDesc ?? "").toLowerCase().includes(query) ||
        (p.code ?? "").toLowerCase().includes(query),
    );
  }

  const catName = (id: number | null) =>
    id ? (categories.find((c) => c.id === id)?.nameBn ?? null) : null;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-ink-soft">
        <Link href="/" className="hover:text-navy-mid">হোম</Link>
        <span>/</span>
        <span className="font-medium text-navy">{activeCat ? activeCat.nameBn : "সব পণ্য"}</span>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="section-title text-3xl text-navy">
            {activeCat ? activeCat.nameBn : "সব পণ্য"}
          </h1>
          <div className="gold-rule mt-2 w-44" />
          <p className="mt-3 max-w-2xl text-ink-soft">
            {activeCat?.description ||
              "অরিজিনাল রুদ্রাক্ষ, পূজা সামগ্রী, পিতলের সামগ্রী ও রুদ্রাক্ষের ব্রেসলেট — সারা বাংলাদেশে হোম ডেলিভারি সুবিধাসহ।"}
          </p>
        </div>
        <div className="rounded-xl border border-paper-deep bg-white px-4 py-2 text-sm text-ink-soft">
          মোট <span className="tnum font-semibold text-navy">{list.length}</span> টি পণ্য
          {query ? <span> · খোঁজ: “{params.q}”</span> : null}
        </div>
      </div>

      <Suspense>
        <div className="scroll-row mt-7 flex gap-3 overflow-x-auto pb-2">
          <Link
            href="/shop"
            className={`shrink-0 rounded-full border px-5 py-2 text-sm transition ${
              !activeCat ? "border-navy bg-navy text-white" : "border-paper-deep bg-white text-navy hover:border-navy-mid"
            }`}
          >
            সব পণ্য
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/shop?category=${c.slug}`}
              className={`shrink-0 rounded-full border px-5 py-2 text-sm transition ${
                activeCat?.id === c.id
                  ? "border-navy bg-navy text-white"
                  : "border-paper-deep bg-white text-navy hover:border-navy-mid"
              }`}
            >
              {c.nameBn}
            </Link>
          ))}
          <Link
            href="/offers"
            className="shrink-0 rounded-full border border-gold bg-gold-soft px-5 py-2 text-sm font-semibold text-gold-deep"
          >
            ★ বিশেষ অফার
          </Link>
        </div>
      </Suspense>

      <div className="mt-8 grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-4">
        {list.map((p) => (
          <ProductCard
            key={p.id}
            whatsapp={settings.whatsapp}
            product={{
              id: p.id,
              nameBn: p.nameBn,
              slug: p.slug,
              price: p.price,
              oldPrice: p.oldPrice,
              image: p.image,
              shortDesc: p.shortDesc,
              stock: p.stock,
              isOffer: p.isOffer,
              offerLabel: p.offerLabel,
              categoryName: catName(p.categoryId),
            }}
          />
        ))}
      </div>

      {list.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-paper-deep bg-white p-14 text-center">
          <div className="font-display text-xl text-navy">কোনো পণ্য পাওয়া যায়নি</div>
          <p className="mt-2 text-ink-soft">অন্য ক্যাটাগরি দেখুন অথবা সার্চ পরিবর্তন করুন।</p>
          <Link href="/shop" className="btn btn-navy mt-5">সব পণ্য দেখুন</Link>
        </div>
      ) : null}
    </div>
  );
}
