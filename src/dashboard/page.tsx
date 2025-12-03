import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-green-600 mb-2">🎉 Giriş Başarılı!</h1>
        <p className="text-gray-500 mb-8">Yönetim paneline hoş geldiniz.</p>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 space-y-3">
          <div className="flex items-center">
            <span className="font-semibold text-blue-900 w-24">Email:</span>
            <span className="text-blue-700">{session.user?.email}</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold text-blue-900 w-24">Rol:</span>
            <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-xs font-bold">
              {session.user?.role || "USER"}
            </span>
          </div>
        </div>

        <div className="mt-8">
            <a 
              href="/api/auth/signout" 
              className="inline-block px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors shadow-md"
            >
              Çıkış Yap
            </a>
        </div>
      </div>
    </div>
  );
}
