import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const s = await getSettings();

  return (
    <div>
      <section className="relative overflow-hidden bg-navy-deep">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.about_image || "/images/about-temple.jpg"} alt="" className="h-full w-full object-cover opacity-45" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/85 to-navy-deep/40" />
        <div className="relative mx-auto max-w-[1280px] px-4 py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/15 px-3 py-1 text-xs text-gold">
            ✦ আমাদের সম্পর্কে
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            {s.about_title} — <span className="text-gold">{s.store_name}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-white/80">{s.about_text}</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="section-title text-2xl text-navy">আমাদের কার্যক্রম</h2>
            <div className="gold-rule mt-2 w-28" />
            <div className="mt-6 space-y-5 text-[0.95rem] leading-relaxed text-ink-soft">
              <p>
                আমরা সরাসরি নেপাল ও ভারতের নির্ভরযোগ্য উৎস থেকে রুদ্রাক্ষ সংগ্রহ করি এবং হাতে বাছাই করে
                পরিষ্কার করে বিক্রয় করি। প্রতিটি দানার গুণগত মান, আকার ও মুখ সংখ্যা যাচাই করা হয়।
              </p>
              <p>
                পূজা সামগ্রী ও পিতলের সামগ্রী তৈরি হয় দক্ষ কারিগরের হাতে। আমাদের লক্ষ্য — প্রতিটি ভক্তের
                ঘরে সঠিক মূল্যে প্রকৃত ও পরিচ্ছন্ন মালামাল পৌঁছে দেওয়া।
              </p>
              <p>
                সারা বাংলাদেশে কুরিয়ার ও হোম ডেলিভারি সুবিধা রয়েছে। ঢাকায় ১-২ দিন এবং ঢাকার বাইরে
                ২-৪ দিনের মধ্যে পণ্য হাতে পৌঁছে যায়। পেমেন্ট করা যায় ক্যাশ অন ডেলিভারি, বিকাশ বা নগদে।
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { t: "১০,০০০+", s: "সন্তুষ্ট গ্রাহক" },
                { t: "৭+ বছর", s: "অভিজ্ঞতা" },
                { t: "৬৪ জেলা", s: "ডেলিভারি কভারেজ" },
              ].map((b) => (
                <div key={b.t} className="rounded-2xl border border-paper-deep bg-white p-5 text-center">
                  <div className="tnum font-display text-2xl font-bold text-navy">{b.t}</div>
                  <div className="mt-1 text-sm text-ink-soft">{b.s}</div>
                </div>
              ))}
            </div>
          </div>

          <aside id="contact" className="h-fit rounded-2xl border border-paper-deep bg-white p-7">
            <h2 className="section-title text-2xl text-navy">যোগাযোগ</h2>
            <div className="gold-rule mt-2 w-24" />
            <ul className="mt-6 space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin size={19} className="mt-0.5 shrink-0 text-gold-deep" />
                <div>
                  <div className="font-semibold text-navy">সরবরাহ ঘর</div>
                  <div className="text-ink-soft">{s.address}</div>
                </div>
              </li>
              <li className="flex gap-3">
                <Phone size={19} className="mt-0.5 shrink-0 text-gold-deep" />
                <div>
                  <div className="font-semibold text-navy">ফোন</div>
                  <a href={`tel:${s.phone}`} className="tnum block text-ink-soft hover:text-navy-mid">{s.phone}</a>
                  <a href={`tel:${s.phone_2}`} className="tnum block text-ink-soft hover:text-navy-mid">{s.phone_2}</a>
                </div>
              </li>
              <li className="flex gap-3">
                <MessageCircle size={19} className="mt-0.5 shrink-0 text-wa-deep" />
                <div>
                  <div className="font-semibold text-navy">WhatsApp</div>
                  <a
                    href={`https://wa.me/${s.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tnum text-ink-soft hover:text-navy-mid"
                  >
                    {s.phone}
                  </a>
                </div>
              </li>
              <li className="flex gap-3">
                <Mail size={19} className="mt-0.5 shrink-0 text-gold-deep" />
                <div>
                  <div className="font-semibold text-navy">ইমেইল</div>
                  <a href={`mailto:${s.email}`} className="break-all text-ink-soft hover:text-navy-mid">{s.email}</a>
                </div>
              </li>
              <li className="flex gap-3">
                <Clock size={19} className="mt-0.5 shrink-0 text-gold-deep" />
                <div>
                  <div className="font-semibold text-navy">খোলার সময়</div>
                  <div className="text-ink-soft">প্রতিদিন সকাল ৯টা – রাত ১০টা</div>
                </div>
              </li>
            </ul>
            <a
              href={`https://wa.me/${s.whatsapp}?text=${encodeURIComponent("আসসালামু আলাইকুম, আমি একটি পণ্য সম্পর্কে জানতে চাই।")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-wa mt-6 w-full"
            >
              <MessageCircle size={18} /> WhatsApp এ মেসেজ করুন
            </a>
            <Link href="/shop" className="btn btn-navy mt-3 w-full">পণ্য দেখুন</Link>
          </aside>
        </div>
      </section>

      <section id="support" className="mx-auto max-w-[1280px] px-4 pb-16">
        <h2 className="section-title text-2xl text-navy">সাধারণ জিজ্ঞাসা (FAQ)</h2>
        <div className="gold-rule mt-2 w-28" />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            {
              q: "পণ্য কি অরিজিনাল?",
              a: "হ্যাঁ, আমাদের প্রতিটি রুদ্রাক্ষ ১০০% অরিজিনাল ও প্রাকৃতিক। প্রয়োজনে সার্টিফিকেটও সরবরাহ করা হয়।",
            },
            {
              q: "ডেলিভারি কত দিনে হয়?",
              a: "ঢাকায় ১-২ দিন এবং ঢাকার বাইরে ২-৪ কর্মদিবসের মধ্যে পণ্য হাতে পৌঁছে যায়।",
            },
            {
              q: "পেমেন্ট কীভাবে করব?",
              a: "ক্যাশ অন ডেলিভারি, বিকাশ ও নগদ — তিনটি মাধ্যমেই পেমেন্ট করা যায়।",
            },
            {
              q: "অর্ডার কীভাবে ট্র্যাক করব?",
              a: "আপনার মোবাইল নম্বর বা অর্ডার নম্বর দিয়ে আমাদের ট্র্যাকিং পেজ থেকে সরাসরি আপডেট দেখতে পারবেন।",
            },
            {
              q: "পণ্য ফেরত দেওয়া যাবে?",
              a: "পণ্যের কোনো ত্রুটি থাকলে ২৪ ঘণ্টার মধ্যে যোগাযোগ করুন — প্রয়োজনে পরিবর্তন করে দেওয়া হবে।",
            },
            {
              q: "হোলসেল অর্ডার হয়?",
              a: "হ্যাঁ, পরিমাণ অনুযায়ী বিশেষ ছাড় দেওয়া হয়। WhatsApp এ যোগাযোগ করুন।",
            },
          ].map((f) => (
            <div key={f.q} className="rounded-2xl border border-paper-deep bg-white p-6">
              <div className="flex items-start gap-3">
                <ShieldCheck size={20} className="mt-0.5 shrink-0 text-gold-deep" />
                <div>
                  <h3 className="font-semibold text-navy">{f.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
