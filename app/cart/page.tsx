"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Minus, ArrowLeft, CheckCircle, CreditCard, Banknote } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Varsayılan Ödeme Yöntemi
  const [paymentMethod, setPaymentMethod] = useState("Kredi Kartı");

  // ⚠️ KENDİ NUMARANI YAZ
  const MY_PHONE_NUMBER = "905555555555"; 

  // 1. ADIM: Hafızayı Güvenli Oku
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) setCart(parsedCart);
      } catch (e) { console.error(e); }
    }
    setIsLoaded(true);
  }, []);

  // 2. ADIM: Değişince Kaydet
  useEffect(() => {
    if (isLoaded) localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart, isLoaded]);

  const increaseQty = (id: string) => {
    setCart(cart.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item));
  };

  const decreaseQty = (id: string) => {
    setCart(cart.map(item => {
      if (item.id === id) return item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item;
      return item;
    }));
  };

  const removeItem = (id: string) => {
    if (confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
        setCart(cart.filter(item => item.id !== id));
    }
  };

  const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // --- SİPARİŞİ TAMAMLA VE WHATSAPP'A GÖNDER ---
  const completeOrder = async () => {
    if (cart.length === 0) return;
    setLoading(true);

    try {
      // 1. Veritabanına Kaydet
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            items: cart, 
            total: totalAmount,
            paymentMethod: paymentMethod 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // 2. WhatsApp Mesajını Hazırla
        const urunListesi = cart.map(i => `▪ ${i.quantity} Adet - ${i.name}`).join("\n");
        
        const mesaj = `📦 *YENİ SİPARİŞ VAR!* (No: #${data.orderId})\n\n🛒 *Sepet İçeriği:*\n${urunListesi}\n\n💰 *Toplam Tutar:* ${totalAmount.toLocaleString("tr-TR")} ₺\n💳 *Ödeme Yöntemi:* ${paymentMethod}`;
        
        // 3. WhatsApp'a Yönlendir
        const whatsappUrl = `https://wa.me/${MY_PHONE_NUMBER}?text=${encodeURIComponent(mesaj)}`;
        
        // Önce sepeti temizle
        setCart([]);
        localStorage.removeItem("cart");
        
        alert("✅ Siparişiniz veritabanına kaydedildi.\nWhatsApp üzerinden iletiliyor...");
        
        // WhatsApp'ı yeni sekmede aç
        window.open(whatsappUrl, "_blank");
        
        // Ana sayfaya dön
        router.push("/dashboard");

      } else {
        alert("❌ Hata: " + data.error);
      }
    } catch (error) {
      alert("Bir bağlantı hatası oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) return <div className="p-20 text-center text-gray-400">Sepet yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
            <button onClick={() => router.push("/dashboard")} className="p-2 bg-white rounded-full shadow hover:bg-gray-100">
                <ArrowLeft size={20} className="text-gray-600"/>
            </button>
            <h1 className="text-3xl font-bold text-slate-800">Sepetim</h1>
        </div>

        {cart.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <p className="text-gray-400 text-xl mb-4">Sepetiniz boş.</p>
              <button onClick={() => router.push("/dashboard")} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Alışverişe Dön</button>
           </div>
        ) : (
           <div className="flex flex-col lg:flex-row gap-8">
              
              {/* SOL: Ürün Listesi */}
              <div className="flex-1 space-y-4">
                 {cart.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {item.image ? (
                                <img src={item.image} className="w-full h-full object-cover" alt={item.name}/>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Resim Yok</div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-sm md:text-base">{item.name}</h3>
                            <p className="text-sm text-gray-500">{item.price} ₺</p>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg">
                            <button onClick={() => decreaseQty(item.id)} className="p-1 hover:bg-white rounded"><Minus size={14} /></button>
                            <span className="font-bold w-6 text-center text-sm">{item.quantity}</span>
                            <button onClick={() => increaseQty(item.id)} className="p-1 hover:bg-white rounded"><Plus size={14} /></button>
                        </div>
                        <div className="font-bold w-20 text-right text-sm md:text-base">{(item.price * item.quantity).toLocaleString("tr-TR")} ₺</div>
                        <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={18} /></button>
                    </div>
                 ))}
              </div>

              {/* SAĞ: Ödeme Alanı */}
              <div className="lg:w-96 space-y-6">
                  <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
                      <h3 className="text-lg font-bold mb-4">Ödeme Yöntemi</h3>
                      
                      <div className="space-y-3">
                          {/* SEÇENEK 1: KREDİ KARTI */}
                          <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'Kredi Kartı' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'hover:bg-gray-50'}`}>
                              <input type="radio" name="payment" value="Kredi Kartı" checked={paymentMethod === 'Kredi Kartı'} onChange={(e) => setPaymentMethod(e.target.value)} />
                              <CreditCard className="text-blue-600"/>
                              <div>
                                  <div className="font-bold text-sm">Kredi Kartı</div>
                                  <div className="text-xs text-gray-500">Güvenli Ödeme</div>
                              </div>
                          </label>

                          {/* SEÇENEK 2: HAVALE / EFT */}
                          <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'Havale/EFT' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'hover:bg-gray-50'}`}>
                              <input type="radio" name="payment" value="Havale/EFT" checked={paymentMethod === 'Havale/EFT'} onChange={(e) => setPaymentMethod(e.target.value)} />
                              <Banknote className="text-green-600"/>
                              <div>
                                  <div className="font-bold text-sm">Havale / EFT</div>
                                  <div className="text-xs text-gray-500">Banka Transferi</div>
                              </div>
                          </label>
                      </div>
                      
                      <div className="mt-3 text-xs text-gray-500 text-center">
                          * Siparişiniz alındıktan sonra detaylar iletilecektir.
                      </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
                      <div className="flex justify-between text-2xl font-bold text-slate-800 mb-6">
                          <span>Toplam</span>
                          <span>{totalAmount.toLocaleString("tr-TR")} ₺</span>
                      </div>

                      <button 
                        onClick={completeOrder} 
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {loading ? "İşleniyor..." : <><CheckCircle size={20} /> Siparişi Onayla & WhatsApp</>}
                      </button>
                  </div>
              </div>

           </div>
        )}
      </div>
    </div>
  );
}