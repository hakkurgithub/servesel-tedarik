import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: Ürünleri Listele
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Ürünler çekilemedi" }, { status: 500 });
  }
}

// POST: Ürün Ekle/Güncelle
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz işlem!" }, { status: 401 });
    }

    const body = await req.json();
    // 'images' alanını da alıyoruz
    const { id, name, description, price, image, images, category, stock, link, isActive } = body;

    const floatPrice = parseFloat(price);
    const intStock = parseInt(stock);

    let product;

    if (id) {
      // GÜNCELLE
      product = await prisma.product.update({
        where: { id },
        data: {
          name, description, price: floatPrice, stock: intStock, 
          image, images, // Yeni alan eklendi
          category: category || "Genel", link: link || "", isActive
        },
      });
    } else {
      // YENİ EKLE
      let slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9ğüşıöç-]/g, '') + "-" + Date.now();
      
      product = await prisma.product.create({
        data: {
          name, slug, description, price: floatPrice, stock: intStock, 
          image, images: images || [], // Yeni alan eklendi
          category: category || "Genel", link: link || "", isActive: isActive ?? true,
        },
      });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "İşlem başarısız" }, { status: 500 });
  }
}

// DELETE: Ürün Sil
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const body = await req.json();
  await prisma.product.delete({ where: { id: body.id } });
  return NextResponse.json({ message: "Silindi" });
}