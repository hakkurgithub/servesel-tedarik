import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma"; // Prisma dosyanın yolu (lib/prisma.ts veya db.ts)
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Bilgiler eksik");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Kullanıcı bulunamadı");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

       if (!isCorrectPassword) {
          throw new Error("Hatalı şifre");
        }

        // DÜZELTME: ID'yi string'e çevirerek yeni bir obje döndürüyoruz
        return {
          id: user.id.toString(), // Number -> String dönüşümü
          email: user.email,
          role: user.role,
          name: user.company || "", // Varsa şirket adını isim olarak alalım
          // İhtiyaç duyulan diğer alanları buraya ekleyebilirsin
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id = user.id;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
};