"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, BookOpen, Calendar, ArrowRight, Newspaper } from "lucide-react";

export default function WartaJemaahPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBloggerPosts() {
      const apiKey = process.env.NEXT_PUBLIC_BLOGGER_API_KEY;
      const blogId = process.env.NEXT_PUBLIC_BLOGGER_BLOG_ID;

      if (!apiKey || !blogId) {
        setError("Missing API Key atau Blog ID di file .env antum, Fal!");
        setLoading(false);
        return;
      }

      try {
        // Tembak API resmi Blogger murni dari sisi client
        const res = await fetch(
          `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts?key=${apiKey}&maxResults=10`
        );

        if (!res.ok) throw new Error("Gagal mengambil respon JSON dari server Blogger Google.");

        const data = await res.json();
        setPosts(data.items || []);
      } catch (err: any) {
        console.error("💥 Error Blogger Fetch:", err);
        setError(err.message || "Gagal memuat warta.");
      } finally {
        setLoading(false);
      }
    }

    fetchBloggerPosts();
  }, []);

  // Fungsi pembantu untuk mengekstrak foto pertama dari konten HTML Blogger sebagai thumbnail/cover
  const extractFirstImage = (htmlContent: string) => {
    const match = htmlContent.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : null;
  };

  // Fungsi membersihkan tag HTML agar menjadi teks bersih untuk deskripsi singkat (snippet)
  const cleanSnippet = (htmlContent: string) => {
    return htmlContent
      .replace(/<[^>]*>/g, "") // Hapus semua tag HTML
      .substring(0, 120) + "..."; // Potong 120 karakter pertama
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">
          Menarik Berita Utama dari Blogger...
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20 pt-10 text-left font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* HEADER BARIS UTAMA */}
        <div className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl border-b-4 border-emerald-500 mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
              <Newspaper className="text-emerald-400" size={24} /> Warta Berita <span className="text-emerald-400">Pondok</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">
              Sinergi Informasi Suara Al Muttaqin Purwokerto
            </p>
          </div>
          <Link href="/login" className="bg-emerald-600 hover:bg-white hover:text-emerald-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
            🔒 Login Jemaah
          </Link>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold uppercase tracking-wider rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* LIST BERITA GRID PREMIUM (Copas Style Indah Antum Semalam!) */}
        {posts.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] py-24 text-center">
            <BookOpen className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Belum ada warta yang diterbitkan di Blogger.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => {
              const coverImage = extractFirstImage(post.content);
              return (
                <article key={post.id} className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex flex-col group">
                  
                  {/* Foto Thumbnail Otomatis */}
                  <div className="w-full aspect-video bg-slate-100 overflow-hidden relative border-b border-slate-50">
                    {coverImage ? (
                      <img src={coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <BookOpen size={40} />
                      </div>
                    )}
                  </div>

                  {/* Isi Konten Kartu */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                        <Calendar size={12} className="text-emerald-500" />
                        {new Date(post.published).toLocaleDateString("id-ID", { dateStyle: "long" })}
                      </div>
                      <h2 className="text-base font-black text-slate-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight leading-snug line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="text-slate-500 text-xs font-medium leading-relaxed line-clamp-3">
                        {cleanSnippet(post.content)}
                      </p>
                    </div>

                    <Link 
                      href={`/warta/${post.id}`}
                      className="inline-flex items-center gap-2 text-[10px] font-black text-emerald-700 hover:text-slate-900 uppercase tracking-widest pt-2 w-max"
                    >
                      Baca Selengkapnya <ArrowRight size={12} />
                    </Link>
                  </div>

                </article>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}