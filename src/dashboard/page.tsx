import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import LogoutButton from "./LogoutButton"; // Az önce oluşturduğumuz butonu kullanacağız

const prisma = new PrismaClient();

export default async function DashboardPage() {
  // 1. Oturum Kontrolü
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  // 2. Veritabanından Ürünleri Çek
  const products = await prisma.product.findMany({
    orderBy: { id: 'desc' }, // En son eklenenler üstte
    include: { category: true } // Kategori ismini de getir
  });

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      
      {/* --- Üst Bar (Header) --- */}
      <header className="bg-white shadow px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Servesel Gıda Paneli</h1>
          <p className="text-sm text-gray-500">
            Hoş geldin, <span className="font-semibold text-blue-600">{session.user?.email}</span>
          </p>
        </div>
        <div>
          <LogoutButton />
        </div>
      </header>

      {/* --- Ana İçerik --- */}
      <main className="p-8 max-w-7xl mx-auto">
        
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
            <h3 className="text-gray-500 text-sm font-medium uppercase">Toplam Ürün</h3>
            <p className="text-4xl font-bold text-gray-800 mt-2">{products.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
            <h3 className="text-gray-500 text-sm font-medium uppercase">Toplam Stok</h3>
            <p className="text-4xl font-bold text-gray-800 mt-2">
              {products.reduce((acc, item) => acc + item.stock, 0)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
            <h3 className="text-gray-500 text-sm font-medium uppercase">Siparişler</h3>
            <p className="text-4xl font-bold text-gray-800 mt-2">0</p>
          </div>
        </div>

        {/* Ürün Listesi Tablosu */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Ürün Listesi</h2>
            <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {products.length} Kayıt
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-3 font-medium border-b">Ürün Adı</th>
                  <th className="px-6 py-3 font-medium border-b">Kategori</th>
                  <th className="px-6 py-3 font-medium border-b">Fiyat</th>
                  <th className="px-6 py-3 font-medium border-b">Stok</th>
                  <th className="px-6 py-3 font-medium border-b">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 text-gray-500">{product.category?.name || "-"}</td>
                      <td className="px-6 py-4 text-gray-900 font-semibold">{product.price} ₺</td>
                      <td className="px-6 py-4 text-gray-600">{product.stock} Adet</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {product.stock > 10 ? 'Stokta Var' : 'Kritik Stok'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Henüz hiç ürün yok. Veritabanı boş görünüyor.
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