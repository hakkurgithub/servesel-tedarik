"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Search, LogOut, Trash2, Facebook, Linkedin, MessageCircle, ExternalLink, Check } from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  // Hangi ürüne tıklandıysa onun ID'sini tutar (Animasyon için)
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/products?time=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.filter((p: any) => p.isActive));
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchProducts();
    
    const savedCart = localStorage.getItem("cart");
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // YENİ SEPETE EKLEME FONKSİYONU (Alert yok, donma yok)
  const addToCart = (product: any) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      setCart(cart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    
    // Buton üzerindeki yazıyı değiştir ve 1 saniye sonra geri al
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1000);
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const shareProduct = (platform: string, product: any) => {
    const url = window.location.href;
    const text = `${product.name} - ${product.price} TL.`;
    let shareUrl = "";
    if (platform === "whatsapp") shareUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
    if (platform === "facebook") shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    if (platform === "linkedin") shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(shareUrl, "_blank");
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div className="p-10 text-center">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm p-4 mb-6 sticky top-0 z-20">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-blue-900">{session?.user?.name || "Bayi Paneli"}</h1>
            <p className="text-gray-500 text-xs">Hoşgeldiniz</p>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => router.push("/cart")} className="relative p-2 text-gray-600 hover:text-blue-600">
                <ShoppingCart size={24} />
                {cart.length > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                        {cart.length}
                    </span>
                )}
             </button>
             <button onClick={() => router.push("/api/auth/signout")} className="text-red-500 text-xs font-bold border border-red-200 px-3 py-1 rounded hover:bg-red-50">
                Çıkış
             </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="text" placeholder="Ürün Ara..." 
              className="w-full pl-10 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group">
                <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">Resim Yok</div>
                  )}
                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                    {product.price} ₺
                  </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-slate-800 mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-3 flex-1 line-clamp-2">{product.description || "Açıklama yok"}</p>
                  
                  {product.link && (
                     <a href={product.link} target="_blank" className="text-xs text-blue-500 flex items-center gap-1 mb-3 hover:underline">
                        <ExternalLink size={12}/> Ürün Detayı
                     </a>
                  )}

                  <div className="flex gap-2 mt-auto">
                     <button 
                       onClick={() => addToCart(product)} 
                       className={`flex-1 py-2 rounded-lg font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2
                       ${addedProductId === product.id 
                            ? "bg-green-600 text-white shadow-green-200" 
                            : "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700"}`}
                     >
                       {addedProductId === product.id ? <><Check size={18}/> Eklendi</> : "Sepete Ekle"}
                     </button>
                  </div>
                  
                  <div className="flex justify-center gap-4 mt-4 pt-3 border-t bg-gray-50 -mx-4 -mb-4 pb-4">
                    <button onClick={() => shareProduct('whatsapp', product)} className="text-green-500 hover:scale-110 transition-transform"><MessageCircle size={20}/></button>
                    <button onClick={() => shareProduct('facebook', product)} className="text-blue-600 hover:scale-110 transition-transform"><Facebook size={20}/></button>
                    <button onClick={() => shareProduct('linkedin', product)} className="text-blue-700 hover:scale-110 transition-transform"><Linkedin size={20}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:block lg:w-80">
          <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 sticky top-24">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-700">
              <ShoppingCart size={20} className="text-blue-600"/> Sepet Özeti
            </h2>
            {cart.length === 0 ? (
              <p className="text-gray-400 text-center py-6 text-sm">Sepetiniz boş.</p>
            ) : (
              <div className="space-y-4">
                <div className="max-h-60 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between items-start text-sm border-b border-gray-100 pb-2 last:border-0">
                      <div>
                        <div className="font-medium text-slate-700 line-clamp-1">{item.name}</div>
                        <div className="text-gray-500 text-xs">{item.quantity} x {item.price} ₺</div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-300 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-base font-bold text-slate-800 mb-3">
                    <span>Toplam</span>
                    <span>{totalAmount.toLocaleString('tr-TR')} ₺</span>
                  </div>
                  <button onClick={() => router.push("/cart")} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg transition-colors text-sm">
                    Sepete Git & Düzenle
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}