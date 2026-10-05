import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { OfferCountdown } from "@/components/Hero";
import { getCategories, getProducts, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function OffersPage() {
  const [settings, categories, products] = await Promise.all([
    getSettings(),
    getCategories(),
    getProducts({}),
  ]);

  const offers = products.filter((p) => p.isOffer || (p.oldPrice && p.oldPrice > p.price));
  const deadline = settings.offer_end
    ? new Date(settings.offer_end).getTime()
    : Date.now() + 3 * 24 * 60 * 60 * 1000;

  const catName = (id: number | null) =>
    id ? (categories.find((c) => c.id === id)?.nameBn ?? null) : null;

  return (
    <div>
      <section className="bg-gold">
        <div className="mx-auto max-w-[1280px] px-4 py-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-navy-deep px-3 py-1 text-[0.72rem] font-semibold text-gold">
            ★ সীমিত সময়ের অফার
          </div>
          <h1 className="mt-4 font-display text-4xl font-extrabold text-navy-deep sm:text-5xl">
            {settings.offer_title}
          </h1>
          <p className="mt-2 max-w-2xl text-navy-deep/80">{settings.offer_subtitle}</p>
          <div className="mt-6">
            <OfferCountdown deadline={deadline} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-4 py-10">
        <nav className="mb-6 flex items-center gap-2 text-sm text-ink-soft">
          <Link href="/" className="hover:text-navy-mid">হোম</Link>
          <span>/</span>
          <span className="font-medium text-navy">বিশেষ অফার</span>
        </nav>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-4">
          {offers.map((p) => (
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

        {offers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-paper-deep bg-white p-14 text-center">
            <div className="font-display text-xl text-navy">এই মুহূর্তে কোনো অফার চলছে না</div>
            <p className="mt-2 text-ink-soft">শীঘ্রই নতুন অফার আসছে — সাথে থাকুন।</p>
            <Link href="/shop" className="btn btn-navy mt-5">সব পণ্য দেখুন</Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
