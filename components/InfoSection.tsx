"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Newspaper, Loader2 } from "lucide-react";

export default function InfoSection() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBloggerForHome() {
      const apiKey = process.env.NEXT_PUBLIC_BLOGGER_API_KEY;
      const blogId = process.env.NEXT_PUBLIC_BLOGGER_BLOG_ID;

      if (!apiKey || !blogId) {
        console.error("Missing Blogger credentials in environment variables.");
        setLoading(false);
        return;
      }

      try {
        // 🚀 FETCH 4 BERITA TERBARU: Sesuai jumlah grid desktop agar tampilan simetris sempurna
        const res = await fetch(
          `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts?key=${apiKey}&maxResults=4`
        );

        if (res.ok) {
          const data = await res.json();
          setArticles(data.items || []);
        }
      } catch (err) {
        console.error("💥 Gagal load warta untuk seksi beranda:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBloggerForHome();
  }, []);

  // Fungsi pembantu mengekstrak gambar pertama dari badan HTML artikel Blogger
  const extractFirstImage = (htmlContent: string) => {
    const match = htmlContent.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : null;
  };

  if (loading) {
    return (
      <div className="py-20 bg-white flex flex-col items-center justify-center space-y-3 border-b border-slate-100">
        <Loader2 className="animate-spin text-emerald-600" size={28} />
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 italic">
          Menyelaraskan Berita Utama Pondok...
        </p>
      </div>
    );
  }

  if (articles.length === 0) return null;

  return (
    <section className="py-20 bg-white relative border-b border-slate-100 font-sans">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Seksi */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div className="text-left border-l-4 border-emerald-600 pl-5">
            <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
              Kabar <span className="text-emerald-600">Pondok</span>
            </h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">
              Update Literasi & Warta Al Muttaqin
            </p>
          </div>
          
          <Link 
            href="/warta" 
            className="group flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-[4px] hover:bg-emerald-600 transition-all shadow-lg active:scale-95"
          >
            Lihat Semua <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ✅ GRID RESPONSIF 4 KOLOM */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.map((item) => {
            const coverImage = extractFirstImage(item.content);

            return (
              <Link 
                key={item.id} 
                href={`/warta/${item.id}`} // ✅ SINKRON: Menggunakan ID murni Blogger agar langsung tembus ke detail Liputan6
                className="group flex flex-col bg-white rounded-[4px] overflow-hidden border border-slate-100 hover:border-emerald-500/30 shadow-sm hover:shadow-xl transition-all duration-500 text-left"
              >
                {/* Bagian Thumbnail */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-50 border-b border-slate-50">
                  {coverImage ? (
                    <img 
                      src={coverImage} 
                      alt={item.title} 
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/bg-player.png"; // Fallback aman jika gambar eksternal brokoli/rusak
                      }}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                      <Newspaper size={24} />
                    </div>
                  )}
                  
                  {/* Label Kategori Statis karena Blogger Mengandalkan Sistem Labels Dinamis */}
                  <div className="absolute top-3 left-3 z-20">
                    <span className="px-2 py-1 bg-emerald-600 text-white text-[7px] font-black uppercase tracking-wider rounded-[2px]">
                      Warta
                    </span>
                  </div>
                </div>

                {/* Bagian Deskripsi / Teks Ringkas */}
                <div className="p-5 flex flex-col flex-1">
                  <time className="text-[8px] font-bold text-slate-400 uppercase mb-2 block">
                    {item.published ? new Date(item.published).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : "--:--"}
                  </time>

                  <h3 className="text-sm font-black text-slate-900 leading-tight mb-4 group-hover:text-emerald-700 transition-colors uppercase italic line-clamp-2">
                    {item.title}
                  </h3>

                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600">
                      Selengkapnya
                    </span>
                    <ChevronRight size={12} className="text-emerald-300 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}