"use client";
import { useState, useEffect } from "react";
import { ShoppingCart, ArrowLeft, MessageCircle, Share2, Check, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import AdSpace from "@/components/AdSpace"; // <-- REKLAM BİLEŞENİNİ ÇAĞIRDIK

export default function ProductDetailClient({ product }: { product: any }) {
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  const [mainImage, setMainImage] = useState(product.image);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
        try { setCart(JSON.parse(savedCart)); } catch(e) {}
    }
  }, []);

  useEffect(() => {
    if (cart.length > 0) localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = () => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
        setCart(cart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
        setCart([...cart, { ...product, quantity: 1 }]);
    }
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const shareProduct = () => {
    const url = window.location.href;
    const text = `Bu ürüne bakmalısın: ${product.name} - ${product.price} TL`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
    window.open(whatsappUrl, "_blank");
  };

  const allImages = [product.image, ...(product.images || [])].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        <button onClick={() => router.back()} className="flex items-center text-gray-500 hover:text-blue-600 mb-6 transition">
            <ArrowLeft size={20} className="mr-2"/> Listeye Dön
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row mb-8">
            
            {/* SOL: RESİM */}
            <div className="md:w-1/2 p-6 bg-gray-50">
                <div className="h-96 w-full bg-white rounded-xl shadow-sm overflow-hidden mb-4 flex items-center justify-center border">
                    {mainImage ? (
                        <img src={mainImage} className="w-full h-full object-contain" alt={product.name} />
                    ) : (
                        <div className="text-gray-400">Resim Yok</div>
                    )}
                </div>
                {allImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {allImages.map((img, i) => (
                            <button key={i} onClick={() => setMainImage(img)} className={`w-20 h-20 rounded-lg border-2 flex-shrink-0 overflow-hidden ${mainImage === img ? 'border-blue-600' : 'border-transparent'}`}>
                                <img src={img} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* SAĞ: DETAYLAR */}
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col">
                <div className="mb-auto">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            {product.category || "Genel"}
                        </span>
                        {product.stock > 0 ? (
                            <span className="text-green-600 text-xs font-bold flex items-center gap-1"><Check size={12}/> Stokta Var ({product.stock})</span>
                        ) : (
                            <span className="text-red-500 text-xs font-bold">Stok Tükendi</span>
                        )}
                    </div>

                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">{product.name}</h1>
                    <div className="text-4xl font-bold text-blue-600 mb-6">{product.price.toLocaleString("tr-TR")} ₺</div>

                    <div className="prose prose-sm text-gray-600 mb-6 border-t border-b py-4">
                        <h3 className="text-gray-900 font-bold mb-2">Ürün Özellikleri</h3>
                        <p className="whitespace-pre-line">{product.description || "Açıklama yok."}</p>
                    </div>

                    {/* --- REKLAM ALANI 1 (KARE) --- */}
                    <AdSpace type="square" />

                    {product.seller && (
                        <div className="flex items-center gap-3 bg-purple-50 p-3 rounded-lg border border-purple-100 mb-8">
                            <div className="bg-purple-200 p-2 rounded-full text-purple-700"><Store size={20}/></div>
                            <div>
                                <div className="text-xs text-purple-600 font-bold uppercase">Satıcı Firma</div>
                                <div className="text-sm font-bold text-slate-800">{product.seller.company || product.seller.name || "Bilinmiyor"}</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3 mt-4">
                    <button onClick={addToCart} className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95 ${isAdded ? "bg-green-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>
                        {isAdded ? <><CheckCircle size={24}/> Sepete Eklendi</> : <><ShoppingCart size={24}/> Sepete Ekle</>}
                    </button>
                    <button onClick={shareProduct} className="w-full py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-2 transition-colors">
                        <MessageCircle size={20}/> WhatsApp'ta Paylaş
                    </button>
                </div>
            </div>
        </div>

        {/* --- REKLAM ALANI 2 (YATAY - Sayfa Altı) --- */}
        <div className="mb-10">
            <AdSpace type="horizontal" />
        </div>

      </div>
    </div>
  );
}

function CheckCircle({size}: {size: number}) { return <Check size={size} />; }