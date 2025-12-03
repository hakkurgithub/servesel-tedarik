import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Oturumu kontrol et
  const session = await getServerSession(authOptions);

  // Eğer giriş yapılmamışsa, giriş sayfasına at
  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <div style={{ padding: "50px", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "green" }}>✅ Giriş Başarılı!</h1>
      <h2>Admin Paneline Hoş Geldiniz</h2>
      
      <div style={{ border: "1px solid #ccc", padding: "20px", marginTop: "20px", borderRadius: "8px" }}>
        <p><strong>Kullanıcı:</strong> {session.user?.email}</p>
        <p><strong>Rol:</strong> {session.user?.role || "Tanımsız"}</p>
        <p><strong>Şirket:</strong> {session.user?.company || "Tanımsız"}</p>
      </div>

      <br />
      <a href="/api/auth/signout" style={{ color: "red", textDecoration: "none", fontWeight: "bold" }}>
        Çıkış Yap
      </a>
    </div>
  );
}