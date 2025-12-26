import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // <--- BU SATIR ÇOK ÖNEMLİ!
// ... diğer importlar
import Header from "@/components/Header";
import AuthProvider from "@/components/AuthProvider"; // 1. Yeni eklediğimiz
import { CartProvider } from "@/components/CartProvider"; // 2. Sepet sağlayıcısı

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Servesel Tedarik - B2B Toptan Satış Portalı",
  description: "Servesel Tedarik B2B Bayi ve Toptan Satış Sistemi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        {/* Tüm siteyi sağlayıcılarla sarmalıyoruz */}
        <AuthProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow bg-gray-50">
                {children}
              </main>
              {/* Footer buraya eklenebilir */}
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}