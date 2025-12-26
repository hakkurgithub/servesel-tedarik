import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// --- ÜRÜNLERİ LİSTELE (GET) ---
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: 'desc' }, // En son eklenen en üstte
      include: { category: true } // Kategori bilgisini de getir
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Ürünler çekilemedi" }, { status: 500 });
  }
}

// --- YENİ ÜRÜN EKLE (POST) ---
export async function POST(req: Request) {
  try {
    // 1. Yetki Kontrolü
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz işlem!" }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, price, stock, image, description, isPublic } = body;

    // 2. Verileri Kontrol Et ve Düzelt (Sayıya Çevir)
    // Gelen veri "100" (yazı) olabilir, bunu 100 (sayı) yapıyoruz.
    const priceInt = parseFloat(price);
    const stockInt = parseInt(stock);

    if (!name || isNaN(priceInt) || isNaN(stockInt)) {
      return NextResponse.json({ error: "Lütfen tüm alanları doğru doldurun." }, { status: 400 });
    }

    // 3. Kategori Kontrolü (Veritabanı boşsa hata vermemesi için)
    // Eğer hiç kategori yoksa otomatik 'Genel' kategorisi oluştur.
    let category = await prisma.category.findFirst();
    if (!category) {
       category = await prisma.category.create({
         data: { name: "Genel", slug: "genel" }
       });
    }

    // 4. Slug Oluştur (URL için isim: aycicek-yagi-123456 gibi)
    const slug = name.toLowerCase()
                     .replace(/ /g, '-')
                     .replace(/[^a-z0-9-]/g, '') // Türkçe karakter sorunu olmasın diye basit temizlik
                     + '-' + Date.now();

    // 5. İşlemi Yap (Güncelleme veya Ekleme)
    if (id) {
      // --- GÜNCELLEME ---
      const updated = await prisma.product.update({
        where: { id: parseInt(id) },
        data: {
            name,
            price: priceInt,
            stock: stockInt,
            image,
            description,
            public: isPublic,
        }
      });
      return NextResponse.json({ success: true, product: updated });
    } else {
      // --- YENİ EKLEME ---
      const newProduct = await prisma.product.create({
        data: {
          name,
          slug: slug,
          price: priceInt,
          stock: stockInt,
          image: image || null,
          description: description || "",
          categoryId: category.id,     // Otomatik bulunan kategori
          sellerId: parseInt(session.user.id), // Giriş yapan admin ID'si
          public: isPublic ?? true,
        }
      });
      return NextResponse.json({ success: true, product: newProduct });
    }

  } catch (error: any) {
    console.error("ÜRÜN KAYIT HATASI:", error); // Terminalde hatayı görmek için
    return NextResponse.json({ error: "İşlem başarısız: " + error.message }, { status: 500 });
  }
}

// --- ÜRÜN SİL (DELETE) ---
export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    try {
        const { id } = await req.json();
        await prisma.product.delete({ where: { id: parseInt(id) } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}