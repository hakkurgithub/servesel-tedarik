import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  // Sadece Admin görebilir
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz Erişim" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      company: true,
      phone: true,
      createdAt: true
    }
  });

  return NextResponse.json(users);
}