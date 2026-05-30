import prisma from "@/lib/prisma";
import Link from "next/link";

// ✅ AMAN: Memastikan data selalu segar dari database & lolos dari prerender kaku pas build
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

async function getAllArticles() {
  try {
    return await prisma.info.findMany({
      where: { 
        // Menerima "publish" maupun "published" agar tidak error lagi
        status: {
          in: ["publish", "published"]
        }, 
        is_active: true 
      },
      include: { category: true },
      orderBy: { created_at: "desc" },
    });
  } catch (error) {
    console.error("💥 Gagal mengambil daftar artikel warta:", error);
    return [];
  }
}

export default async function WartaListPage() {
  const articles = await getAllArticles();

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Section */}
      <section className="bg-emerald-950 pt-28 pb-16 relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-5xl relative z-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter mb-3">
            Warta <span className="text-yellow-400">Pondok</span>
          </h1>
          <p className="text-emerald-200/80 text-[10px] md:text-xs max-w-xl mx-auto font-bold uppercase tracking-[0.2em] leading-relaxed">
            Pusat Informasi & Kabar Terbaru Radio Suara Al Muttaqin
          </p>
        </div>
        {/* Dekorasi Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800/20 rounded-full blur-[100px]"></div>
      </section>

      {/* Kontainer Artikel */}
      <div className="container mx-auto px-6 max-w-5xl -mt-8">
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => {
              // 🟢 ANTIDOTE TIMEOUT: Deteksi jika ada thumbnail fosil yang mengarah ke domain mati rsm.my.id
              const hasBadDomain = article.thumbnail && article.thumbnail.includes("rsm.my.id");
              const safeThumbnail = hasBadDomain ? "/bg-player.png" : article.thumbnail;

              return (
                <Link 
                  href={`/warta/${article.slug}`} 
                  key={article.id}
                  className="group bg-white rounded-[4px] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-emerald-900/10 transition-all duration-500 flex flex-col border border-slate-100 hover:border-emerald-500/30"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                    {safeThumbnail ? (
                      /* 🟢 FIX UTAMA: Menggunakan tag img standar untuk mem-bypass proses download static image pas build Vercel */
                      <img
                        src={safeThumbnail}
                        alt={article.title || "Warta"}
                        loading="lazy"
                        onError={(e) => {
                          // Jika link rusak/mati, ganti otomatis ke gambar cadangan lokal
                          (e.target as HTMLImageElement).src = "/bg-player.png";
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 text-3xl">
                        📻
                      </div>
                    )}
                    {/* Label Kategori */}
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-white/95 backdrop-blur-md text-emerald-900 text-[8px] font-black uppercase tracking-widest shadow-sm rounded-[2px] border border-emerald-50">
                        {article.category?.name || "Warta"}
                      </span>
                    </div>
                  </div>

                  {/* Konten Kartu */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <time className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {article.created_at ? new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : "--:--"}
                      </time>
                    </div>
                    
                    <h2 className="text-lg font-black text-slate-900 leading-tight mb-3 group-hover:text-emerald-700 transition-colors line-clamp-2 uppercase italic tracking-tight">
                      {article.title}
                    </h2>

                    <p className="text-slate-500 text-[11px] font-medium line-clamp-2 mb-5 leading-relaxed">
                      {article.excerpt || "Klik untuk membaca kabar selengkapnya dari Pondok..."}
                    </p>

                    <div className="mt-auto pt-4 border-t border-slate-50">
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2 group-hover:gap-3 transition-all">
                        Baca Selengkapnya <span>→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-20 rounded-[4px] text-center shadow-sm border border-slate-100">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <span className="text-2xl">📭</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 uppercase italic mb-2">Belum Ada Warta</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Stay tuned untuk info terbaru dari kami</p>
          </div>
        )}
      </div>
    </main>
  );
}