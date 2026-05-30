import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

// 🟢 MANTRA KEAMANAN NEXT.JS: Menjamin Turbopack meloloskan halaman kategori tanpa prerender kaku pas build
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  // Ambil data kategori sekaligus relasi artikelnya
  const category = await prisma.infoCategory.findUnique({
    where: { slug },
    include: {
      infos: {
        where: {
          // ✅ FIX SKEMA: Menerima status "publish" maupun "published" agar gank data aman
          status: {
            in: ["publish", "published"]
          },
          is_active: true,
        },
        orderBy: {
          created_at: "desc",
        },
      },
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-32 pb-20 text-left font-sans">
      <div className="container mx-auto px-6 max-w-7xl">

        {/* BREADCRUMB - Menggunakan gaya miring tajam khas RSM */}
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 italic">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <span className="text-slate-200">/</span>
          <Link href="/warta" className="hover:text-emerald-600 transition-colors">Warta</Link>
          <span className="text-slate-200">/</span>
          <span className="text-slate-900 font-bold truncate max-w-[200px]">{category.name}</span>
        </nav>

        {/* TITLE SECTION */}
        <div className="mb-16 border-l-4 border-emerald-600 pl-5">
          <p className="text-[9px] font-black tracking-[0.3em] text-emerald-600 mb-2 uppercase">
            Arsip Kategori
          </p>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 uppercase italic tracking-tighter">
            {category.name}
          </h1>
        </div>

        {/* GRID ARTIKEL */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {category.infos.map((post) => {
            // 🟢 ANTIDOTE TIMEOUT: Cek dan amankan thumbnail dinamis dari sisa domain lama
            const hasBadDomain = post.thumbnail && post.thumbnail.includes("rsm.my.id");
            const safeThumbnail = hasBadDomain ? "/bg-player.png" : post.thumbnail;

            return (
              <Link
                key={post.id}
                href={`/warta/${post.slug}`}
                className="group flex flex-col bg-white rounded-[4px] overflow-hidden border border-slate-100 hover:border-emerald-500/30 shadow-sm hover:shadow-xl transition-all duration-500"
              >
                {/* THUMBNAIL CONTAINER */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-50">
                  {safeThumbnail ? (
                    /* 🟢 FIX UTAMA: Menggunakan tag img standar HTML untuk mem-bypass download static image Vercel pas build */
                    <img
                      src={safeThumbnail}
                      alt={post.title || "Thumbnail Kategori"}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/bg-player.png";
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-3xl">
                      📻
                    </div>
                  )}
                </div>

                {/* CONTENT CARD */}
                <div className="p-6 flex flex-col flex-1">
                  {/* DATE */}
                  <time className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                    {post.created_at ? new Date(post.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }) : "--:--"}
                  </time>

                  {/* TITLE - Menyelaraskan font-style tipografi utama */}
                  <h2 className="text-lg font-black text-slate-900 leading-tight mb-3 group-hover:text-emerald-700 transition-colors line-clamp-2 uppercase italic tracking-tight">
                    {post.title}
                  </h2>

                  {/* EXCERPT */}
                  {post.excerpt && (
                    <p className="text-slate-500 text-[11px] font-medium line-clamp-2 mb-5 leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}

                  {/* BUTTON ACTION ACTION */}
                  <div className="mt-auto pt-4 border-t border-slate-50">
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                      Baca Selengkapnya <span>→</span>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* JIKA KOSONG - Penyelarasan box rounded */}
        {category.infos.length === 0 && (
          <div className="py-20 text-center bg-white border border-slate-100 shadow-sm rounded-[4px] max-w-xl mx-auto mt-12 animate-in fade-in duration-500">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <span className="text-xl">📭</span>
            </div>
            <h2 className="text-md font-black text-slate-900 uppercase italic mb-1">Belum Ada Warta</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              Belum ada materi dakwah yang diunggah untuk kategori ini.
            </p>
          </div>
        )}

      </div>
    </main>
  );
}