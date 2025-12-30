"use client";
import { useState, useEffect } from "react";
import { Package, Search, Edit, Trash2, Check, X, ExternalLink, Image as ImageIcon } from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Verileri Çek
  const fetchProducts = async () => {
    try {
      // time=... parametresi tarayıcının hafızadan okumasını engeller (Cache-Busting)
      const res = await fetch(`/api/products?time=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Hata:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  // AKTİF/PASİF YAP
  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    // Anında ekranda göster (Hız hissi için)
    setProducts(products.map(p => p.id === id ? { ...p, isActive: newStatus } : p));

    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: newStatus }),
    });
    fetchProducts(); // Garanti olsun diye veriyi tazele
  };

  // SİL
  const handleDelete = async (id: string) => {
    if (!confirm("Bu ürünü silmek istediğine emin misin?")) return;
    setProducts(products.filter(p => p.id !== id)); 
    await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
    });
  };

  // KAYDET / GÜNCELLE
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProduct),
    });

    setEditingProduct(null);
    fetchProducts(); // Listeyi yenile
    alert("Kayıt Başarılı!");
  };

  // Yeni Ürün Ekleme Modunu Başlat
  const startNewProduct = () => {
    setEditingProduct({
        name: "",
        price: 0,
        stock: 0,
        description: "",
        image: "",
        link: "",
        category: "Genel",
        isActive: true
    });
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-10 text-center">Yükleniyor...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <Package className="text-blue-600" /> Ürün Yönetimi
        </h1>
        
        <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input 
                type="text" 
                placeholder="Ara..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
            </div>
            <button onClick={startNewProduct} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700">
                + Yeni Ürün
            </button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className={`bg-white p-4 rounded-lg shadow border-l-4 ${product.isActive ? 'border-green-500' : 'border-red-500'} flex flex-col md:flex-row items-center justify-between gap-4`}>
            
            {/* Resim Önizleme */}
            <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                {product.image ? (
                    <img src={product.image} className="w-full h-full object-cover" alt="img" />
                ) : (
                    <ImageIcon className="text-gray-300 w-full h-full p-4" />
                )}
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-lg">{product.name}</h3>
              <p className="text-sm text-gray-500">{product.category} | Stok: {product.stock}</p>
              <div className="text-blue-600 font-bold mt-1">{product.price} ₺</div>
              {product.link && (
                 <a href={product.link} target="_blank" className="text-xs text-blue-500 flex items-center gap-1 mt-1 hover:underline">
                    <ExternalLink size={12}/> Tedarikçi Linki
                 </a>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => toggleStatus(product.id, product.isActive)}
                className={`px-3 py-1 rounded-full text-xs font-bold ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {product.isActive ? "Aktif" : "Pasif"}
              </button>
              <button onClick={() => setEditingProduct(product)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                <Edit size={20} />
              </button>
              <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded">
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DÜZENLEME MODALI */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingProduct.id ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</h2>
            <form onSubmit={handleUpdate} className="space-y-3">
              <div className="flex flex-col gap-2">
  <label className="text-xs font-bold text-gray-500">Ürün Özellikleri</label>
  <textarea
    rows={4} // Kutunun yüksekliği
    className="w-full border p-2 rounded"
    placeholder="Ürün içeriği, faydaları ve detaylarını buraya yazınız..."
    // Veritabanındaki 'description' alanına bağlıyoruz:
    value={editingProduct.description || ""} 
    onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
  />
</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-500">Fiyat</label>
                  <input type="number" className="w-full border p-2 rounded" required
                    value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500">Stok</label>
                  <input type="number" className="w-full border p-2 rounded" required
                    value={editingProduct.stock} onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">Resim URL (Google'dan kopyala yapıştır)</label>
                <input className="w-full border p-2 rounded" 
                  value={editingProduct.image || ""} placeholder="https://..."
                  onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})} />
              </div>
              {editingProduct.image && (
                  <div className="w-20 h-20 mx-auto border rounded overflow-hidden">
                      <img src={editingProduct.image} className="w-full h-full object-cover" alt="Önizleme" />
                  </div>
              )}
              <div>
                <label className="text-xs font-bold text-gray-500">Kategori</label>
                <input className="w-full border p-2 rounded" 
                  value={editingProduct.category || ""} placeholder="Genel, Elektronik..."
                  onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">Tedarikçi Linki</label>
                <input className="w-full border p-2 rounded" 
                  value={editingProduct.link || ""} placeholder="Link..."
                  onChange={(e) => setEditingProduct({...editingProduct, link: e.target.value})} />
              </div>
              <div className="flex gap-2 mt-4 pt-2 border-t">
                <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 bg-gray-200 p-2 rounded">İptal</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}