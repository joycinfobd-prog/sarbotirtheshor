-- Seed data for সর্বতীর্থেশ্বর মহাদেব রুদ্রাক্ষ ভান্ডার
-- Safe to re-run: all inserts are conflict-tolerant.

INSERT INTO categories (name_bn, slug, image, description, sort_order, is_active) VALUES
  ('রুদ্রাক্ষ', 'rudraksha', '/images/p-mala.jpg', 'নেপালি ও ভারতীয় অরিজিনাল রুদ্রাক্ষ — বিভিন্ন মুখী ও আকারে।', 1, true),
  ('পূজা সামগ্রী', 'puja-samagri', '/images/p-puja-thali.jpg', 'পূজার প্রয়োজনীয় সব সামগ্রী এক জায়গায়।', 2, true),
  ('পিতলের ব্রেসলেট', 'brass-bracelet', '/images/p-bracelet.jpg', 'হাতে তৈরি পিতলের ঐতিহ্যবাহী ব্রেসলেট।', 3, true),
  ('পিতলের সামগ্রী', 'brass-samagri', '/images/p-kalash.jpg', 'পিতলের কলস, প্রতিমা, ঘণ্টা ও পূজার সামগ্রী।', 4, true),
  ('রুদ্রাক্ষের ব্রেসলেট', 'rudraksha-bracelet', '/images/p-bracelet.jpg', 'রুদ্রাক্ষের দানা দিয়ে তৈরি ব্রেসলেট ও হ্যান্ড চেইন।', 5, true),
  ('রুদ্রাক্ষের মালা', 'rudraksha-mala', '/images/p-mala.jpg', '১০৮+১ দানার জপমালা, রুদ্রাক্ষের মালা।', 6, true),
  ('অন্যান্য', 'others', '/images/p-lingam.jpg', 'স্ফটিক, শিবলিংগ, তান্ত্রিক ও অন্যান্য সামগ্রী।', 7, true)
ON CONFLICT (slug) DO UPDATE SET name_bn = EXCLUDED.name_bn, image = EXCLUDED.image;

INSERT INTO products (code, name_bn, slug, category_id, price, old_price, image, short_desc, description, stock, sold_count, is_live, is_offer, offer_label, sort_order)
VALUES
  ('SR-1001', '৫ মুখী রুদ্রাক্ষের মালা (১০৮+১) – নেপালি', '5-mukhi-rudraksha-mala-nepali',
   (SELECT id FROM categories WHERE slug='rudraksha-mala'), 1700, 2000, '/images/p-mala.jpg',
   'নেপালি অরিজিনাল ৫ মুখী রুদ্রাক্ষ, ১০৮+১ দানা',
   'নেপাল থেকে সরাসরি সংগৃহীত ৫ মুখী রুদ্রাক্ষের জপমালা। প্রতিটি দানা হাতে বাছাই করা, পরিষ্কার ও মজবুত সুতোয় গাঁথা। জপ, ধ্যান ও দৈনিক পরিধানের জন্য উপযুক্ত।',
   25, 148, true, true, '১৫% ছাড়', 1),
  ('SR-1002', 'পিতলের কূর্ম দেব', 'brass-kurma-tortoise',
   (SELECT id FROM categories WHERE slug='brass-samagri'), 380, 450, '/images/p-brass-turtle.jpg',
   'হাতে খোদাই করা পিতলের কূর্ম প্রতিমা',
   'ঘর ও পূজার ঘরে রাখার জন্য আকর্ষণীয় পিতলের কূর্ম দেব। পালিশড পিতল, টেকসই নকশা।',
   40, 96, true, false, null, 2),
  ('SR-1003', '২-৫ মুখী রুদ্রাক্ষ মালা', '2-5-mukhi-rudraksha-mala',
   (SELECT id FROM categories WHERE slug='rudraksha-mala'), 3500, null, '/images/p-mala.jpg',
   'বিশেষ সংযোজনের ২ থেকে ৫ মুখী রুদ্রাক্ষ মালা',
   'নির্বাচিত ২, ৩, ৪ ও ৫ মুখী রুদ্রাক্ষ দিয়ে গাঁথানো বিশেষ মালা। প্রতিটি দানা পরীক্ষিত ও অরিজিনাল।',
   12, 41, true, false, null, 3),
  ('SR-1004', '৩৩ সিং রুদ্রাক্ষের ব্রেসলেট মালা', '33-sing-rudraksha-bracelet',
   (SELECT id FROM categories WHERE slug='rudraksha-bracelet'), 2300, 2800, '/images/p-bracelet.jpg',
   '৩৩ সিং রুদ্রাক্ষ দিয়ে তৈরি ব্রেসলেট',
   '৩৩ সিং রুদ্রাক্ষের দানা দিয়ে তৈরি আলাদাভাবে পরিধানযোগ্য ব্রেসলেট। মজবুত ইলাস্টিক, আরামদায়ক ফিট।',
   18, 77, true, true, 'বিশেষ মূল্য', 4),
  ('SR-1005', '৫-৬-৭ মুখী মাল্লকারীর কবর মালা', '5-6-7-mukhi-mala',
   (SELECT id FROM categories WHERE slug='rudraksha-mala'), 2300, null, '/images/p-mala.jpg',
   '৫, ৬ ও ৭ মুখী রুদ্রাক্ষের সমন্বয়ে মালা',
   'বিশেষ ভাবে বাছাই করা ৫, ৬ ও ৭ মুখী রুদ্রাক্ষের সমন্বয়ে তৈরি মালা। ধ্যান ও সাধনার জন্য উপযুক্ত।',
   15, 33, true, false, null, 5),
  ('SR-1006', 'স্ফটিকের মালা', 'sphatik-mala',
   (SELECT id FROM categories WHERE slug='others'), 1200, 1500, '/images/p-lingam.jpg',
   'প্রাকৃতিক স্ফটিক দানার মালা',
   'প্রাকৃতিক স্ফটিক (স্ফটিক) দানা দিয়ে তৈরি মালা। স্বচ্ছ ও ঠান্ডা স্পর্শ, মনন শান্ত রাখতে সহায়ক।',
   22, 64, true, true, '২০% ছাড়', 6),
  ('SR-1007', 'পিতলের পূজা থালি সেট', 'brass-puja-thali-set',
   (SELECT id FROM categories WHERE slug='puja-samagri'), 1250, 1600, '/images/p-puja-thali.jpg',
   'সম্পূর্ণ পিতলের পূজা থালি সেট',
   'খোদাই করা পিতলের থালি, ছোট পাত্র, ঘণ্টা, দীপ ও ধূপদানী সহ সম্পূর্ণ পূজা সেট। বিয়ে ও পূজার জন্য আদর্শ।',
   10, 52, true, true, '২২% ছাড়', 7),
  ('SR-1008', 'পিতলের কলস জোড়া', 'brass-kalash-pair',
   (SELECT id FROM categories WHERE slug='brass-samagri'), 950, null, '/images/p-kalash.jpg',
   'ঠাটানো পিতলের কলস (২টি)',
   'ঐতিহ্যবাহী নকশায় তৈরি পিতলের কলস জোড়া। পূজা, বিয়ে ও শুভ কাজে ব্যবহারযোগ্য।',
   28, 45, true, false, null, 8),
  ('SR-1009', 'কালো পাথরের শিবলিংগ', 'black-stone-shivling',
   (SELECT id FROM categories WHERE slug='others'), 1450, 1800, '/images/p-lingam.jpg',
   'পালিশড কালো পাথরের শিবলিংগ ও আসন',
   'একটি টুকরো কালো পাথর থেকে নির্মিত পালিশড শিবলিংগ, সাথে খোদাই করা আসন ও পিতলের নাগ।',
   9, 38, true, true, '১৯% ছাড়', 9),
  ('SR-1010', 'রুদ্রাক্ষের ব্রেসলেট (ক্লাসিক)', 'rudraksha-bracelet-classic',
   (SELECT id FROM categories WHERE slug='rudraksha-bracelet'), 650, 850, '/images/p-bracelet.jpg',
   'দৈনিক পরিধানের রুদ্রাক্ষ ব্রেসলেট',
   'প্রাকৃতিক রুদ্রাক্ষের দানা ও পিতলের স্পেসার দিয়ে তৈরি ক্লাসিক ব্রেসলেট। পুরুষ ও মহিলা — সবার জন্য।',
   60, 210, true, true, '২৩% ছাড়', 10),
  ('SR-1011', 'পিতলের ঘণ্টা ও দীপ সেট', 'brass-bell-diya-set',
   (SELECT id FROM categories WHERE slug='puja-samagri'), 780, null, '/images/p-puja-thali.jpg',
   'পূজার ঘণ্টা ও পিতলের দীপ',
   'মোটা পিতলের তৈরি পূজার ঘণ্টা ও দীপের সেট। সুন্দর শব্দ ও দীর্ঘস্থায়ী উজ্জ্বলতা।',
   35, 71, true, false, null, 11),
  ('SR-1012', '৭ মুখী রুদ্রাক্ষ (একক)', '7-mukhi-rudraksha',
   (SELECT id FROM categories WHERE slug='rudraksha'), 2100, null, '/images/p-mala.jpg',
   'নেপালি ৭ মুখী অরিজিনাল রুদ্রাক্ষ',
   'নেপালের পাহাড়ি অঞ্চল থেকে সংগৃহীত ৭ মুখী রুদ্রাক্ষ। মুখ স্পষ্ট, আকৃতি গোলাকার ও ভারী।',
   7, 19, true, false, null, 12)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO reviews (name, role, rating, text, sort_order, is_active) VALUES
  ('মোঃ রবিউল ইসলাম', 'ঢাকা', 5, 'খুব ভালো মালা পেয়েছি। দাম অনুযায়ী অসাধারণ। অরিজিনাল মালা পাওয়া যায়। ধন্যবাদ!', 1, true),
  ('লাকফোর আক্তার', 'চট্টগ্রাম', 4, 'কাস্টমার সার্ভিস চমৎকার। দ্রুত ডেলিভারি পেয়েছি। আরও কিছু করা যেতো।', 2, true),
  ('সুমন সাহা', 'সিরাজগঞ্জ', 5, 'পণ্য পেয়ে খুশি হলাম। প্যাকেজিং সুন্দর ছিল। ভবিষ্যতেও কিনবো ইনশাআল্লাহ।', 3, true)
ON CONFLICT DO NOTHING;

INSERT INTO admin_users (name, phone, password_hash, role, is_active)
VALUES ('সুপার অ্যাডমিন', '01794608874', '0ad8e32ce7252acf628d13961031fc5f:151dbec82dad6e6d013f009ea73038e890df4559386830c3e2177211565bca20801995211bc9b954eb2c4cbd49c34db3254ca168e58eb2a7d4457781373f1052', 'owner', true)
ON CONFLICT (phone) DO NOTHING;

INSERT INTO settings ("key", value) VALUES
  ('whatsapp', '8801794608874'),
  ('phone', '01794-608874'),
  ('phone_2', '01794-608874'),
  ('offer_end', '')
ON CONFLICT ("key") DO NOTHING;
