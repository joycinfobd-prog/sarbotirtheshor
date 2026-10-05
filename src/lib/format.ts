export const WHATSAPP_NUMBER = "8801794608874";
export const WHATSAPP_DISPLAY = "01794-608874";

export function taka(amount: number): string {
  const n = Math.round(amount || 0).toLocaleString("en-US");
  return `৳ ${n}`;
}

export function toBnDigits(value: string | number): string {
  const map = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(value).replace(/[0-9]/g, (d) => map[Number(d)]);
}

export function orderCode(): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  const stamp = Date.now().toString(36).slice(-4).toUpperCase();
  return `SR-${stamp}${rand}`;
}

export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[^\w\u0980-\u09FF]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "item"}-${Math.random().toString(36).slice(2, 7)}`;
}

export function waLink(text: string, number: string = WHATSAPP_NUMBER): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export type WaOrderInput = {
  code: string;
  customerName: string;
  phone: string;
  address: string;
  note?: string | null;
  items: { nameBn: string; price: number; qty: number }[];
  total: number;
  deliveryFee?: number;
  paymentMethod?: string;
};

export function orderMessage(input: WaOrderInput): string {
  const lines: string[] = [
    "*সর্বতীর্থেশ্বর মহাদেব রুদ্রাক্ষ ভান্ডার*",
    "নতুন অর্ডার এসেছে ✅",
    "",
    `অর্ডার নং: *${input.code}*`,
    `নাম: ${input.customerName}`,
    `মোবাইল: ${input.phone}`,
    `ঠিকানা: ${input.address}`,
  ];
  if (input.note) lines.push(`নোট: ${input.note}`);
  lines.push("", "*অর্ডারকৃত পণ্য:*");
  input.items.forEach((it, i) => {
    lines.push(`${i + 1}. ${it.nameBn} × ${it.qty} = ৳${(it.price * it.qty).toLocaleString("en-US")}`);
  });
  lines.push(
    "",
    `পণ্যের মূল্য: ৳${(input.total - (input.deliveryFee || 0)).toLocaleString("en-US")}`,
    `ডেলিভারি চার্জ: ৳${(input.deliveryFee || 0).toLocaleString("en-US")}`,
    `সর্বমোট: *৳${input.total.toLocaleString("en-US")}*`,
    `পেমেন্ট: ${input.paymentMethod === "cod" ? "ক্যাশ অন ডেলিভারি" : "বিকাশ/নগদ"}`,
    "",
    "ধন্যবাদ — আমাদের সাথে থাকার জন্য 🙏",
  );
  return lines.join("\n");
}

export function trackMessage(code: string, phone: string): string {
  return `আসসালামু আলাইকুম, আমার অর্ডার নং: ${code}, মোবাইল: ${phone}। অর্ডারের আপডেট জানাবেন কোন।`;
}
