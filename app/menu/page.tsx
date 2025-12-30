"use client";
import { useState, useEffect } from "react";
import { ShoppingCart, Search, Check, ExternalLink, MessageCircle, Facebook, Linkedin, X, ChevronRight, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MenuPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  
  // TAM EKRAN MODU İÇİN (LIGHTBOX)
  const [selectedProductImages, setSelectedProductImages] = useState<string[] | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  useEffect(() => { localStorage.setItem("cart", JSON.stringify(cart)); }, [cart]);

  const addToCart = (product: any) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      setCart(cart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1000);
  };

  const shareProduct = (platform: string, product: any) => {
    const url = window.location.href;
    const text = `${product.name} - ${product.price} TL.`;
    let shareUrl = "";
    if (platform === "whatsapp") shareUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
    if (platform === "facebook") shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    if (platform === "linkedin") shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(shareUrl, "_blank");
  };

  // Resme Tıklayınca Aç
  const openLightbox = (product: any) => {
    const allImages = [];
    if (product.image) allImages.push(product.image);
    if (product.images && Array.isArray(product.images)) allImages.push(...product.images);
    
    if (allImages.length > 0) {
        setSelectedProductImages(allImages);
        setCurrentImageIndex(0);
    }
  };

  // Sonraki Resim
  const nextImage = (e: any) => {
    e.stopPropagation();
    if (selectedProductImages) {
        setCurrentImageIndex((prev) => (prev + 1) % selectedProductImages.length);
    }
  };

  // Önceki Resim
  const prevImage = (e: any) => {
    e.stopPropagation();
    if (selectedProductImages) {
        setCurrentImageIndex((prev) => (prev - 1 + selectedProductImages.length) % selectedProductImages.length);
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div className="p-20 text-center text-gray-500">Ürünler yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Üst Bar */}
      <div className="bg-white shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-800">Toptan Ürünlerimiz</h1>
            <button onClick={() => router.push("/cart")} className="relative p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100">
                <ShoppingCart size={24} />
                {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{cart.length}</span>}
            </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="relative max-w-md mx-auto mb-10">
            <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input type="text" placeholder="Ürün Ara..." className="w-full pl-10 p-3 rounded-full border outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        {filteredProducts.length === 0 ? <div className="text-center text-gray-500">Ürün bulunamadı.</div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-lg transition-all flex flex-col">
                
                {/* RESİM ALANI (TIKLANABİLİR) */}
                <div 
                    className="h-56 w-full bg-gray-100 relative overflow-hidden cursor-zoom-in group"
                    onClick={() => openLightbox(product)}
                >
                    {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">Resim Yok</div>
                    )}
                    
                    {/* Çoklu resim varsa ikon göster */}
                    {product.images && product.images.length > 0 && (
                        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                            +{product.images.length} Foto
                        </div>
                    )}
                    
                    <div className="absolute top-3 right-3 bg-white/90 text-slate-800 text-sm font-bold px-3 py-1 rounded-full shadow-sm">{product.price} ₺</div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                    <div className="text-xs font-bold text-blue-500 mb-1 uppercase">{product.category || "Genel"}</div>
                    <h2 className="font-bold text-lg text-slate-800 mb-2">{product.name}</h2>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">{product.description || "Açıklama yok."}</p>
                    {product.link && <a href={product.link} target="_blank" className="text-xs text-blue-500 flex items-center gap-1 mb-4 hover:underline"><ExternalLink size={12}/> Ürün Detayları</a>}
                    
                    <button onClick={() => addToCart(product)} className={`w-full py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 ${addedProductId === product.id ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
                        {addedProductId === product.id ? <><Check size={18}/> Eklendi</> : <><ShoppingCart size={18}/> Sepete Ekle</>}
                    </button>

                     <div className="flex justify-center gap-4 mt-4 pt-3 border-t border-gray-50">
                        <button onClick={() => shareProduct('whatsapp', product)} className="text-gray-400 hover:text-green-500 hover:scale-110"><MessageCircle size={20}/></button>
                        <button onClick={() => shareProduct('facebook', product)} className="text-gray-400 hover:text-blue-600 hover:scale-110"><Facebook size={20}/></button>
                        <button onClick={() => shareProduct('linkedin', product)} className="text-gray-400 hover:text-blue-700 hover:scale-110"><Linkedin size={20}/></button>
                     </div>
                </div>
                </div>
            ))}
            </div>
        )}
      </div>

      {/* TAM EKRAN RESİM GÖSTERİCİ (LIGHTBOX) */}
      {selectedProductImages && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedProductImages(null)}>
            <button className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full transition"><X size={32}/></button>
            
            <div className="relative max-w-4xl max-h-screen w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                <img 
                    src={selectedProductImages[currentImageIndex]} 
                    className="max-h-[85vh] max-w-full rounded-lg shadow-2xl object-contain" 
                    alt="Tam Ekran"
                />
                
                {/* Ok Tuşları (Birden fazla resim varsa) */}
                {selectedProductImages.length > 1 && (
                    <>
                        <button onClick={prevImage} className="absolute left-2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition"><ChevronLeft size={24}/></button>
                        <button onClick={nextImage} className="absolute right-2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition"><ChevronRight size={24}/></button>
                        
                        {/* Sayfa Göstergesi */}
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                            {currentImageIndex + 1} / {selectedProductImages.length}
                        </div>
                    </>
                )}
            </div>
        </div>
      )}
    </div>
  );
}