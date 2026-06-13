// 🟢 PAKSA NEXT.JS UNTUK SELALU MENGEKSEKUSI JALUR INI SEBAGAI API DINAMIS SERVER (ANTI-CACHE HTML)
export const dynamic = "force-dynamic";
export const revalidate = 0;

import NextAuth, { NextAuthOptions, DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";

// 🟢 1. Perluas tipe data Session secara resmi agar TypeScript mengenali properti 'id'
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

// 2. Definisikan opsi konfigurasi secara eksplisit
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
  
  // 3. Gunakan strategi database karena kita pakai PrismaAdapter
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 Hari
  },

  // 🟢 4. Kunci Cookies Konfigurasi untuk Mencegah Kebocoran Subdomain / Sub-routing Sanity Studio
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/", // Mengunci session token agar berlaku mutlak di root domain, tidak tertelan sub-rute
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  callbacks: {
    // Menyinkronkan ID user dari database ke objek session di frontend
    // Karena menggunakan strategy: "database", parameter kedua yang diterima adalah 'user', bukan 'token'
    session: async ({ session, user }) => {
      if (session?.user && user?.id) {
        session.user.id = user.id;
      }
      return session;
    },
  },

  // 5. Konfigurasi halaman custom
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error', 
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development", // Aktifkan log saat development
};

// 6. Export handler untuk App Router Next.js
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };