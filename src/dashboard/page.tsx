import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import LogoutButton from "./LogoutButton"; // Az önce oluşturduğumuz butonu çağırıyoruz

const prisma = new PrismaClient();

export default async function DashboardPage() {
  // 1. Oturum Kontrolü
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  // 2. Ürünleri Veritabanından Çek (En son eklenen 10 ürün)
  const products = await prisma.product.findMany({
    take: 10,
    orderBy: { id: 'desc' },
    include: { category: true } // Kategori ismini de çekelim
  });

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* --- Üst Bar (Header) --- */}
      <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Servesel Gıda Paneli</h1>
          <p className="text-sm text-gray-500">Hoş geldin, <span className="font-semibold text-blue-600">{session.user?.email}</span></p>
        </div>
        <div>
          <LogoutButton />
        </div>
      </header>

      {/* --- Ana İçerik --- */}
      <main className="p-6 max-w-7xl mx-auto">
        
        {/* Özet Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <h3 className="text-gray-500 text-sm font-medium">Toplam Ürün</h3>
            <p className="text-3xl font-bold text-gray-800">{products.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <h3 className="text-gray-500 text-sm font-medium">Aktif Kullanıcı</h3>
            <p className="text-3xl font-bold text-gray-800">1</p> {/* Şimdilik sabit */}
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
            <h3 className="text-gray-500 text-sm font-medium">Siparişler</h3>
            <p className="text-3xl font-bold text-gray-800">0</p>
          </div>
        </div>

        {/* Ürün Tablosu */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">Son Eklenen Ürünler</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 border-b">Ürün Adı</th>
                  <th className="px-6 py-3 border-b">Kategori</th>
                  <th className="px-6 py-3 border-b">Fiyat</th>
                  <th className="px-6 py-3 border-b">Stok</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 text-gray-500">{product.category?.name || "-"}</td>
                      <td className="px-6 py-4 text-gray-900">{product.price} ₺</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {product.stock} Adet
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      Henüz hiç ürün yok. Seed işlemini yaptınız mı?
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}