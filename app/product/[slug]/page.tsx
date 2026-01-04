import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";

// 1. Dinamik SEO Başlıkları (Google'da çıkacak başlık ve açıklama)
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
  });

  if (!product) return { title: "Ürün Bulunamadı" };

  return {
    title: `${product.name} | Servesel Tedarik`,
    description: `${product.name} en uygun fiyatla Servesel Tedarik'te. ${product.description?.slice(0, 100)}... Hemen sipariş ver!`,
    openGraph: {
        title: product.name,
        description: product.description || "Toptan ürün tedariği",
        images: product.image ? [product.image] : [],
    }
  };
}

// Sayfa Bileşeni
export default async function ProductPage({ params }: { params: { slug: string } }) {
  // 2. Ürünü Veritabanından Çek
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { 
        seller: { select: { name: true, company: true } } // Satıcı bilgisini de al
    }
  });

  if (!product) notFound(); // Ürün yoksa 404 sayfası göster

  // 3. Google için Yapısal Veri (Schema Markup - JSON-LD)
  // Bu kod sayesinde Google, arama sonuçlarında fiyatı ve stok durumunu doğrudan gösterebilir.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.image ? [product.image] : [],
    "description": product.description,
    "sku": product.id,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "TRY",
      "price": product.price,
      "url": `https://servesel-tedarik.vercel.app/product/${product.slug}`,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": product.seller?.company || "Servesel Tedarik"
      }
    }
  };

  return (
    <div>
        {/* Google Botları için gizli JSON-LD verisi */}
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        {/* Görsel Arayüz */}
        <ProductDetailClient product={product} />
    </div>
  );
}