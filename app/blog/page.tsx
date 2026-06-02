"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  BookOpen,
  Calendar,
  ArrowRight,
  Newspaper,
} from "lucide-react";

export default function WartaJemaahPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBloggerPosts() {
      const apiKey = process.env.NEXT_PUBLIC_BLOGGER_API_KEY;
      const blogId = process.env.NEXT_PUBLIC_BLOGGER_BLOG_ID;

      if (!apiKey || !blogId) {
        setError("Missing API Key atau Blog ID.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts?key=${apiKey}&maxResults=12`
        );

        if (!res.ok) {
          throw new Error(
            `Google API Error (${res.status}). Periksa API Key, Blog ID, dan status blog.`
          );
        }

        const data = await res.json();
        setPosts(data.items || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Gagal memuat berita.");
      } finally {
        setLoading(false);
      }
    }

    fetchBloggerPosts();
  }, []);

  const extractFirstImage = (htmlContent: string) => {
    const match = htmlContent?.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : null;
  };

  const cleanSnippet = (htmlContent: string) => {
    const text = htmlContent.replace(/<[^>]*>/g, "").trim();

    return text.length > 120
      ? text.substring(0, 120) + "..."
      : text;
  };

  const extractSlugFromUrl = (url: string) => {
    if (!url) return "";

    const parts = url.split("/");
    const lastPart = parts[parts.length - 1];

    return lastPart.replace(".html", "");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-emerald-600" size={36} />
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
          Memuat Warta Pondok...
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white pb-24 pt-10">
      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="border-b border-slate-200 pb-6 mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-5">

          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md mb-4">
              <Newspaper size={12} />
              Update Terbaru
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
              Warta <span className="text-emerald-600">Pondok</span>
            </h1>

            <p className="text-sm text-slate-500 mt-2">
              Informasi, kegiatan, dan literasi terbaru Pondok Al Muttaqin
            </p>
          </div>

          <div className="hidden md:block text-sm text-slate-500">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* EMPTY */}
        {posts.length === 0 && !error ? (
          <div className="py-24 text-center">
            <BookOpen
              className="mx-auto mb-4 text-slate-300"
              size={48}
            />
            <p className="text-slate-500 font-medium">
              Belum ada artikel yang diterbitkan.
            </p>
          </div>
        ) : (

          /* GRID BERITA */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-7 gap-y-10">

            {posts.map((post) => {
              const coverImage = extractFirstImage(post.content);
              const slug =
                extractSlugFromUrl(post.url) || post.id;

              return (
                <article
                  key={post.id}
                  className="group"
                >
                  <Link href={`/blog/${slug}`}>

                    {/* THUMBNAIL */}
                    <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-100 mb-4">

                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={post.title}
                          loading="lazy"
                          onError={(e) => {
                            (
                              e.target as HTMLImageElement
                            ).src = "/bg-player.png";
                          }}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                          <BookOpen size={42} />
                        </div>
                      )}

                      <div className="absolute top-3 left-3">
                        <span className="bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded">
                          Warta
                        </span>
                      </div>
                    </div>

                    {/* META */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                      <Calendar size={12} />
                      {new Date(post.published).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </div>

                    {/* JUDUL */}
                    <h2 className="text-xl font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {post.title}
                    </h2>

                    {/* SNIPPET */}
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-2">
                      {cleanSnippet(post.content)}
                    </p>

                    {/* LINK */}
                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-emerald-600">
                      Baca Selengkapnya
                      <ArrowRight
                        size={14}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </div>

                  </Link>
                </article>
              );
            })}

          </div>
        )}
      </div>
    </main>
  );
}