"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LivePlayer from "@/components/LivePlayer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // 🟢 KUNCI CAKUPAN CMS: Mendeteksi secara ketat semua variasi rute dashboard Sanity Studio
  const isStudio = 
    pathname === "/studio" || 
    pathname?.startsWith("/studio/") || 
    pathname === "/admin" || 
    pathname?.startsWith("/admin/");

  // Jika jemaah/admin sedang berada di area Sanity Studio, langsung kembalikan konten polos tanpa layout web biasa
  if (isStudio) {
    return <main className="min-h-screen bg-gray-900">{children}</main>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar hanya dirender di web publik */}
      <header className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </header>
      
      {/* Area Konten Utama Publik */}
      <main className="flex-grow pt-24 md:pt-28">
        {children}
      </main>

      {/* Footer dan LivePlayer hanya muncul untuk jemaah di web biasa */}
      <Footer />
      <LivePlayer />
    </div>
  );
}