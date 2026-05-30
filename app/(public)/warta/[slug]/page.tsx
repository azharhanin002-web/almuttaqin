import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ShareButtons from "@/components/ShareButtons";
import ReadingProgress from "@/components/ReadingProgress";
import TableOfContents from "@/components/TableOfContents";
import RelatedPost from "@/components/RelatedPost";
import CommentSection from "@/components/CommentSection";
import Ads from "@/components/Ads";

// ✅ AMAN: Mengunci halaman detail ke mode dinamis penuh untuk membantai prerender error pas build Vercel
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

/**
 * TYPE DEFINITION
 */
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

/**
 * HELPER: Menghitung estimasi waktu baca (Safety Check Included)
 */
function readingTime(text: string | null | undefined) {
  if (!text) return 1;
  const clean = text.replace(/<[^>]+>/g, "");
  const words = clean.split(/\s+/).length;
  return Math.ceil(words / 200) || 1;
}

/**
 * GENERATE METADATA: SEO & Social Media
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; // ✅ Await params wajib di Next.js 15+
  
  try {
    const article = await prisma.info.findUnique({ 
      where: { slug }, 
      include: { category: true } 
    });
    
    if (!article) return { title: "Artikel Tidak Ditemukan | Radio RSM" };
    
    // Ambil cuplikan teks bersih untuk description
    const plainText = article.content ? article.content.replace(/<[^>]+>/g, "").slice(0, 160) : "";
    
    // Antidote domain lama untuk meta image
    const metaImage = article.thumbnail && !article.thumbnail.includes("rsm.my.id") 
      ? article.thumbnail 
      : "https://radioalmuttaqin.com/og-default.jpg"; // alihkan ke og default jika masih rsm.my.id
    
    return {
      title: `${article.title} | Radio Suara Al Muttaqin`,
      description: plainText,
      alternates: { canonical: `https://radioalmuttaqin.com/warta/${article.slug}` },
      openGraph: { 
        title: article.title, 
        description: plainText, 
        images: [{ url: metaImage }], 
        type: "article" 
      },
      twitter: {
        card: "summary_large_image",
        title: article.title,
        description: plainText,
        images: [metaImage],
      }
    };
  } catch (error) {
    return { title: "Radio Suara Al Muttaqin Purwokerto" };
  }
}

/**
 * MAIN PAGE COMPONENT
 */
export default async function ArticleDetailPage({ params, searchParams }: Props) {
  // ✅ 1. Await dynamic APIs
  const { slug } = await params;
  await searchParams; // Await untuk stabilitas server-side

  // ✅ 2. Parallel Data Fetching
  const [article, popular] = await Promise.all([
    prisma.info.findUnique({ 
      where: { 
        slug,
        status: { in: ["publish", "published"] },
        is_active: true
      }, 
      include: { category: true } 
    }),
    prisma.info.findMany({
      where: { status: { in: ["publish", "published"] }, is_active: true },
      take: 5,
      orderBy: { created_at: "desc" },
    })
  ]);
  
  if (!article) notFound();

  const readTime = readingTime(article.content);
  const shareUrl = "https://radioalmuttaqin.com/warta/" + article.slug;

  // ✅ 3. Logika Pemecahan Konten (Mencegah error .indexOf null)
  const content = article.content || "";
  const splitIndex = content.indexOf("</p>");
  
  let firstPart = content;
  let secondPart = "";

  if (splitIndex !== -1) {
    const cutPoint = splitIndex + 4; 
    firstPart = content.slice(0, cutPoint);
    secondPart = content.slice(cutPoint);
  }

  // Pengaman URL domain lama untuk gambar utama
  const hasBadMainDomain = article.thumbnail && article.thumbnail.includes("rsm.my.id");
  const safeMainThumbnail = hasBadMainDomain ? "/bg-player.png" : article.thumbnail;

  return (
    <>
      <ReadingProgress />

      <main className="min-h-screen bg-white pb-20 pt-6 overflow-visible text-left font-sans">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">

          {/* BREADCRUMB */}
          <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 italic">
            <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
            <span className="text-slate-200">/</span>
            <Link href={`/warta/kategori/${article.category?.slug}`} className="hover:text-emerald-600">
              {article.category?.name || "Warta"}
            </Link>
            <span className="text-slate-200">/</span>
            <span className="text-slate-900 truncate max-w-[200px] font-bold">{article.title}</span>
          </nav>

          {/* HEADER */}
          <header className="max-w-5xl mb-12">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
              {article.title}
            </h1>
            <div className="flex items-center gap-3 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-t border-slate-50 pt-5">
              
              <div className="flex items-center gap-2">
                {/* Tetap menggunakan Image Next.js karena memuat Aset Lokal internal, 100% Aman */}
                <Image 
                  src="/icon.png" 
                  alt="Icon RSM" 
                  width={14} 
                  height={14} 
                  className="rounded-full shrink-0" 
                />
                <span className="text-emerald-600">Redaksi Al Muttaqin</span>
              </div>

              <span className="text-slate-200">•</span>
              <span>{new Date(article.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
              <span className="text-slate-200">•</span>
              <span>{readTime} Menit Baca</span>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-8">
              {safeMainThumbnail && (
                <div className="mb-12 overflow-hidden rounded-[4px] border border-slate-50 shadow-2xl shadow-slate-100">
                  <div className="relative aspect-video w-full">
                    {/* 🟢 FIX UTAMA: Menggunakan tag img standar untuk membantai bypass proses static download pas build Vercel */}
                    <img 
                      src={safeMainThumbnail} 
                      alt={article.title || "Thumbnail"} 
                      loading="eager"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/bg-player.png";
                      }}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-8 gap-8 relative">
                <aside className="hidden lg:block lg:col-span-1">
                  <div className="sticky top-28">
                    <ShareButtons url={shareUrl} title={article.title} />
                  </div>
                </aside>

                <div className="lg:col-span-7">
                  <TableOfContents />

                  <article
                    className="article-content prose prose-slate prose-xl max-w-none text-left
                    [&_p]:text-[1.1rem] [&_p]:leading-[1.8] [&_p]:mb-8 [&_p]:text-slate-700 [&_p]:font-medium
                    [&_h2]:text-2xl [&_h2]:font-black [&_h2]:mb-6 [&_h2]:mt-12 [&_h2]:scroll-mt-32
                    [&_h3]:text-xl [&_h3]:font-black [&_h3]:mb-4 [&_h3]:mt-8 [&_h3]:scroll-mt-32
                    prose-strong:text-slate-900 prose-strong:font-black
                    prose-img:rounded-[4px] prose-img:shadow-lg"
                  >
                    <div dangerouslySetInnerHTML={{ __html: firstPart }} />
                    {secondPart && <Ads />}
                    <div dangerouslySetInnerHTML={{ __html: secondPart }} />
                  </article>

                  <div className="mt-20 pt-10 border-t border-slate-50">
                    <RelatedPost currentPostId={article.id} categoryId={article.category_id || ""} />
                  </div>

                  <CommentSection infoId={article.id} />
                </div>
              </div>
            </div>

            {/* SIDEBAR */}
            <aside className="lg:col-span-4 relative h-full">
              <div className="sticky top-28 space-y-12">
                <section>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-1 h-5 bg-emerald-600"></div>
                    <h4 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-900 italic">Terpopuler</h4>
                  </div>

                  <div className="space-y-6">
                    {popular.map((item) => {
                      const hasBadSidebarDomain = item.thumbnail && item.thumbnail.includes("rsm.my.id");
                      const safeSidebarThumbnail = hasBadSidebarDomain ? "/bg-player.png" : item.thumbnail;

                      return (
                        <Link 
                          href={`/warta/${item.slug}`} 
                          key={item.id} 
                          className="group flex gap-4 items-center pb-6 border-b border-slate-50 last:border-0 last:pb-0"
                        >
                          <div className="relative w-16 h-16 shrink-0 overflow-hidden rounded-[4px] bg-slate-100 border border-slate-50">
                            {safeSidebarThumbnail ? (
                              /* 🟢 FIX KEDUA: Menggunakan tag img standar pada loop sidebar terpopuler */
                              <img 
                                src={safeSidebarThumbnail} 
                                alt={item.title || "Popular Post"} 
                                loading="lazy"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/bg-player.png";
                                }}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-300">RSM</div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h5 className="text-[13px] font-black text-slate-800 leading-tight group-hover:text-emerald-600 transition-colors line-clamp-2 tracking-tight">
                              {item.title}
                            </h5>
                            <time className="text-[9px] text-slate-400 mt-2 block font-black uppercase tracking-widest">
                              {item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "--:--"}
                            </time>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}