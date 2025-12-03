"use client"; // Bu satır butonun tarayıcıda çalışmasını sağlar

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })} // Çıkış yapınca ana sayfaya (/) git
      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
    >
      Çıkış Yap
    </button>
  );
}