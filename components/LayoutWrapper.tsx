"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LivePlayer from "@/components/LivePlayer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Cek apakah URL diawali dengan /studio atau /admin
  const isStudio = pathname?.startsWith("/studio") || pathname?.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar hanya dirender jika bukan area CMS Sanity */}
      {!isStudio && (
        <header className="fixed top-0 left-0 w-full z-50">
          <Navbar />
        </header>
      )}
      
      {/* Area Konten Utama: Menggunakan padding-top otomatis jika jemaah membuka web biasa */}
      <main className={`flex-grow ${!isStudio ? "pt-24 md:pt-28" : ""}`}>
        {children}
      </main>

      {/* Footer dan LivePlayer otomatis hilang dari pandangan saat admin di /studio */}
      {!isStudio && <Footer />}
      {!isStudio && <LivePlayer />}
    </div>
  );
}