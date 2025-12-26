import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Sadece auth
import { prisma } from "@/lib/prisma";    // <--- YENİ: Prisma düzeltildi

// ... kodun geri kalanı aynı kalsın

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Önce giriş yapmalısın! /login adresine git." }, { status: 401 });
  }

  // Kullanıcıyı veritabanında ADMIN yap
  const updatedUser = await prisma.user.update({
    where: { email: session.user.email },
    data: { role: "ADMIN" }
  });

  return NextResponse.json({ 
    durum: "BAŞARILI! ✅",
    mesaj: "Hesabın yetkisi 'ADMIN' olarak güncellendi.",
    kullanici: session.user.email,
    ONEMLI_NOT: "Ayarların geçerli olması için ŞİMDİ ÇIKIŞ YAPIP TEKRAR GİRMELİSİN."
  });
}