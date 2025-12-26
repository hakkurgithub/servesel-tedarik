import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // 1. Oturum Kontrolü
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Oturum açmalısınız." }, { status: 401 });
    }

    const body = await req.json();
    const { items, total } = body;

    // 2. Kullanıcıyı Bul
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    // 3. Siparişi Veritabanına Kaydet
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        total: parseFloat(total),
        status: "Bekleniyor (WP)", // Durumu belirttik
        items: JSON.stringify(items)
      }
    });

    // Başarılı, sipariş numarasını ön yüze gönder
    return NextResponse.json({ success: true, orderId: order.id });

  } catch (error: any) {
    console.error("Sipariş Hatası:", error);
    return NextResponse.json({ error: "Sipariş alınamadı: " + error.message }, { status: 500 });
  }
}