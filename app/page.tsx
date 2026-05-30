import prisma from "@/lib/prisma";
import Hero from "@/components/Hero";
import LiveSection from "@/components/LiveSection";
import InfoSection from "@/components/InfoSection"; 

// Panggil komponen gabungan baru (Double Lane - Jadwal & Chat)
import RadioInteractionHub from "@/components/RadioInteractionHub";
// Tetap panggil DonasiSection dari wrapper client
import { DonasiSection } from "@/components/ClientSections"; 

// 🟢 MANTRA KEAMANAN MUTLAK: Mengunci beranda ke dinamis penuh agar lolos build Vercel tanpa drama
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

async function getLatestWarta() {
  try {
    const rawData = await prisma.info.findMany({
      where: { 
        // Melonggarkan saringan agar semua berita aktif di Supabase langsung tersedot rapi
        is_active: true 
      }, 
      orderBy: { created_at: "desc" },
      take: 4,
      include: { category: true }
    });

    if (!rawData || rawData.length === 0) return [];

    // 🟢 PROSES SANITASI MUTLAK: Memetakan data asli Supabase agar strukturnya aman dibaca InfoSection
    return rawData.map((item) => ({
      id: item.id,
      slug: item.slug || "#",
      // Memastikan judul bersih dari spasi berlebih dan menggunakan format kapitalisasi yang konsisten
      title: item.title ? item.title.trim() : "Warta Tanpa Judul",
      excerpt: item.excerpt || item.content?.substring(0, 100) || "Klik selengkapnya untuk membaca warta...",
      thumbnail: item.thumbnail || "/bg-player.png",
      // Amankan konversi tanggal agar tidak merusak fungsi format Date di sisi klien
      created_at: item.created_at ? new Date(item.created_at).toISOString() : new Date().toISOString(),
      category: {
        name: item.category?.name || "Kabar"
      }
    }));

  } catch (error) {
    console.error("💥 Gagal memproses data warta asli Supabase:", error);
    return []; // Kembalikan array kosong agar halaman utama tidak crash total jika db lelah
  }
}

export default async function Home() {
  const latestWarta = await getLatestWarta();

  return (
    <main className="relative min-h-screen bg-white">
      {/* 🚀 LAYER 1: Hero Banner & Player Utama */}
      <Hero />
      
      {/* 🚀 PLAYER UTAMA: Mengatur putar/stop radio beserta visualisator spektrum canvas neon */}
      <LiveSection />

      {/* 🚀 LAYER 2: Jadwal Siaran (Kiri) & Live Chat Komunitas (Kanan) */}
      <RadioInteractionHub />

      {/* 🚀 LAYER 3: Warta/Berita Pondok Pesantren & Informasi Donasi */}
      {/* ✅ SEKARANG DIJAMIN RAPI: Menggunakan data asli Supabase yang sudah disanitasi ketat */}
      <InfoSection articles={latestWarta} />
      
      <DonasiSection 
        bsi="7120202043" 
        bri="0022 01 028443 53 3"
        an="Baitul Maal Al Muttaqin"
      />
    </main>
  );
}