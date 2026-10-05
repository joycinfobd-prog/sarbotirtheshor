import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { CartToast } from "@/components/CartToast";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { WishlistProvider } from "@/components/Wishlist";
import { getCategories, getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "সর্বতীর্থেশ্বর মহাদেব রুদ্রাক্ষ ভান্ডার | রুদ্রাক্ষ ও পূজা সামগ্রী",
  description:
    "সর্বতীর্থেশ্বর মহাদেব রুদ্রাক্ষ ভান্ডার — অরিজিনাল রুদ্রাক্ষ মালা, পূজা সামগ্রী, পিতলের সামগ্রী ও রুদ্রাক্ষের ব্রেসলেট। সারা বাংলাদেশে হোম ডেলিভারি, ক্যাশ অন ডেলিভারি।",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);

  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+Da+2:wght@400;500;600;700;800&family=Hind+Siliguri:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen font-body antialiased">
        <CartProvider>
          <WishlistProvider>
            <Header settings={settings} categories={categories} />
            <main>{children}</main>
            <Footer settings={settings} categories={categories} />
            <WhatsAppFab number={settings.whatsapp} />
            <MobileBottomNav />
            <CartToast />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
