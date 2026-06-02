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
        console.error("Missing Blogger credentials.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts?key=${apiKey}&maxResults=4`
        );

        if (res.ok) {
          const data = await res.json();
          setArticles(data.items || []);
        }
      } catch (err) {
        console.error("Gagal mengambil data Blogger:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBloggerForHome();
  }, []);

  const extractFirstImage = (htmlContent: string) => {
    const match = htmlContent?.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : null;
  };

  const extractSlugFromUrl = (url: string) => {
    if (!url) return "";
    const parts = url.split("/");
    const lastPart = parts[parts.length - 1];
    return lastPart.replace(".html", "");
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-emerald-600" size={28} />
        <p className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-400">
          Memuat Kabar Pondok...
        </p>
      </div>
    );
  }

  if (!articles.length) return null;

  return (
    <section className="py-20 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">

          <div className="border-l-4 border-emerald-600 pl-5">
            <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tight text-slate-900">
              News <span className="text-emerald-600">Update</span>
            </h2>

            <p className="mt-2 text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400">
              Update Literasi & Blog Al Muttaqin
            </p>
          </div>

          <Link
            href="/blog"
            className="group flex items-center gap-2 px-5 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Lihat Semua
            <ChevronRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        {/* GRID BERITA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">

          {articles.map((item) => {
            const coverImage = extractFirstImage(item.content);
            const slug = extractSlugFromUrl(item.url) || item.id;

            return (
              <Link
                key={item.id}
                href={`/blog/${slug}`}
                className="group block"
              >

                {/* THUMBNAIL */}
                <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-100 mb-4">

                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt={item.title}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/bg-player.png";
                      }}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                      <Newspaper size={40} />
                    </div>
                  )}

                  {/* LABEL */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-emerald-600 text-white text-[8px] font-black uppercase tracking-wider rounded">
                      Blog
                    </span>
                  </div>
                </div>

                {/* JUDUL */}
                <h3 className="text-lg font-bold leading-snug text-slate-900 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                  {item.title}
                </h3>

                {/* TANGGAL */}
                <p className="mt-2 text-sm text-slate-500">
                  {item.published
                    ? new Date(item.published).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                      })
                    : "--"}
                </p>

              </Link>
            );
          })}

        </div>
      </div>
    </section>
  );
}