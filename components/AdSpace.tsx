export default function AdSpace({ type }: { type: 'horizontal' | 'square' }) {
  return (
    <div className={`my-6 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 font-bold text-sm text-center p-4
      ${type === 'horizontal' ? 'w-full h-32' : 'w-full h-64'}`}>
      
      <span>📢 REKLAM ALANI</span>
      <span className="text-xs font-normal mt-1">Google AdSense Kodu Buraya Gelecek</span>
      
      {/* İLERİDE GOOGLE KODUNU BURAYA YAPIŞTIRACAĞIZ */}
      {/* <ins className="adsbygoogle" ... ></ins>
      */}
    </div>
  );
}