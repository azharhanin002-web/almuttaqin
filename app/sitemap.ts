import prisma from "@/lib/prisma";

// 🟢 MANTRA PENYELAMAT: Memaksa sitemap digenerate secara dinamis saat diakses jemaah / bot Google
// Ini akan membantai eror ENOIDENTIFIER selamanya dari proses build Vercel!
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET() {
  const baseUrl = "https://radioalmuttaqin.com";

  try {
    // Tarik daftar slug artikel dari Supabase
    const articles = await prisma.info.findMany({
      where: {
        status: { in: ["publish", "published"] },
        is_active: true,
      },
      select: {
        slug: true,
        created_at: true,
      },
    });

    // Rancang dokumen XML sitemap secara dinamis
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${baseUrl}</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      <url>
        <loc>${baseUrl}/jadwal</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>
      <url>
        <loc>${baseUrl}/warta</loc>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
      </url>
      ${articles
        .map((art) => `
        <url>
          <loc>${baseUrl}/warta/${art.slug}</loc>
          <lastmod>${new Date(art.created_at).toISOString()}</lastmod>
          <changefreq>monthly</changefreq>
          <priority>0.6</priority>
        </url>
        `).join("")}
    </urlset>`;

    // Kembalikan sebagai dokumen XML murni
    return new Response(sitemapXml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200",
      },
    });
  } catch (error) {
    console.error("💥 Gagal merakit sitemap dinamis:", error);
    
    // Fallback sitemap standar jika database terputus, agar sitemap.xml TIDAK CRASH (Biar Google SEO aman)
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url><loc>${baseUrl}</loc><priority>1.0</priority></url>
      <url><loc>${baseUrl}/jadwal</loc><priority>0.8</priority></url>
      <url><loc>${baseUrl}/warta</loc><priority>0.8</priority></url>
    </urlset>`;

    return new Response(fallbackXml, {
      headers: { "Content-Type": "application/xml" },
    });
  }
}