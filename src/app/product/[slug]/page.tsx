import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, MessageCircle, ShieldCheck, Truck } from "lucide-react";
import { ProductActions } from "@/components/ProductActions";
import { ProductCard } from "@/components/ProductCard";
import { getProductBySlug, getProducts, getSettings } from "@/lib/data";
import { taka as takaLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [settings, allProducts] = await Promise.all([getSettings(), getProducts({})]);

  const related = allProducts
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
        <Link href="/" className="hover:text-navy-mid">হোম</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-navy-mid">পণ্য</Link>
        <span>/</span>
        <span className="font-medium text-navy">{product.nameBn}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-2xl border border-paper-deep bg-white">
            {product.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.image} alt={product.nameBn} className="aspect-[4/3] w-full object-cover" />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center text-ink-soft">ছবি নেই</div>
            )}
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {(product.images ?? []).slice(0, 4).map((img, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-paper-deep">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" className="aspect-square w-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div>
          {product.code ? (
            <div className="text-[0.75rem] uppercase tracking-[0.18em] text-gold-deep">
              পণ্য কোড: <span className="tnum">{product.code}</span>
            </div>
          ) : null}
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-navy sm:text-4xl">
            {product.nameBn}
          </h1>
          <div className="gold-rule mt-3 w-32" />

          <div className="mt-5 flex items-baseline gap-3">
            <span className="tnum font-display text-4xl font-extrabold text-wa-deep">
              {takaLabel(product.price)}
            </span>
            {product.oldPrice && product.oldPrice > product.price ? (
              <span className="tnum text-lg text-ink-soft line-through">{takaLabel(product.oldPrice)}</span>
            ) : null}
            {product.oldPrice && product.oldPrice > product.price ? (
              <span className="rounded-md bg-alert px-2 py-1 text-xs font-bold text-white">
                সাশ্রয় {takaLabel(product.oldPrice - product.price)}
              </span>
            ) : null}
          </div>

          {product.shortDesc ? <p className="mt-4 text-ink-soft">{product.shortDesc}</p> : null}

          <div className="mt-6">
            <ProductActions
              whatsapp={settings.whatsapp}
              product={{
                id: product.id,
                nameBn: product.nameBn,
                slug: product.slug,
                price: product.price,
                image: product.image,
                stock: product.stock,
              }}
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: <ShieldCheck size={20} />, t: "১০০% অরিজিনাল", s: "মালামালের নিশ্চয়তা" },
              { icon: <Truck size={20} />, t: "হোম ডেলিভারি", s: "সারা বাংলাদেশে" },
              { icon: <BadgeCheck size={20} />, t: "ক্যাশ অন ডেলিভারি", s: "হাতে পেয়ে পেমেন্ট" },
            ].map((b) => (
              <div key={b.t} className="rounded-xl border border-paper-deep bg-white p-4">
                <div className="text-navy-mid">{b.icon}</div>
                <div className="mt-2 text-sm font-semibold text-navy">{b.t}</div>
                <div className="text-xs text-ink-soft">{b.s}</div>
              </div>
            ))}
          </div>

          {product.description ? (
            <div className="mt-8 rounded-2xl border border-paper-deep bg-white p-6">
              <h2 className="section-title text-xl text-navy">পণ্যের বিবরণ</h2>
              <div className="gold-rule mt-2 w-20" />
              <p className="mt-4 whitespace-pre-line leading-relaxed text-ink-soft">{product.description}</p>
            </div>
          ) : null}

          <a
            href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
              `আসসালামু আলাইকুম, আমি "${product.nameBn}" সম্পর্কে জানতে চাই।`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-wa mt-6 w-full"
          >
            <MessageCircle size={18} /> পণ্য সম্পর্কে জিজ্ঞাসা করুন
          </a>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="section-title text-2xl text-navy">সম্পর্কিত পণ্য</h2>
          <div className="gold-rule mt-2 w-32" />
          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-4">
            {related.map((p) => (
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
                }}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
