// ✅ 1. PAKSA DYNAMIC: Kunci utama agar data tidak "nyangkut" di cache Vercel
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * [GET] - Mengambil semua artikel untuk tabel admin brrrrrrrrrrrrrrooo
 */
export async function GET(req: NextRequest) {
  try {
    // 2. Ambil data dengan Prisma
    const infos = await prisma.info.findMany({
      include: {
        category: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // ✅ 3. Return dengan header anti-cache yang sangat ketat
    return NextResponse.json(infos || [], {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error: any) {
    console.error("❌ API GET ERROR:", error.message);
    return NextResponse.json(
      { error: "Gagal menarik data. Aris, cek apakah DATABASE_URL di Vercel sudah benar!", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * [POST] - Menyimpan artikel baru
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content, thumbnail, category_id, status, tags, slug: manualSlug } = body;

    // 1. Validasi Dasar (Savage Validation)
    if (!title || !content || !category_id) {
      return NextResponse.json(
        { error: "Waduh, data belum lengkap! Judul, Konten, dan Kategori wajib diisi." },
        { status: 400 }
      );
    }

    // 2. Logika Slug: Pakai manual dari frontend (Auto-Slug) atau generate darurat
    const finalSlug = manualSlug 
      ? manualSlug 
      : title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "") + "-" + Math.floor(Math.random() * 1000);

    // 3. Simpan ke Database
    const newInfo = await prisma.info.create({
      data: {
        title,
        slug: finalSlug,
        content,
        thumbnail: thumbnail || null,
        category_id: category_id,
        status: status || "publish", // Standardisasi ke 'publish'
        tags: tags || null,
        is_active: true,
      },
    });

    // 4. Paksa Revalidasi Path (PENTING!)
    // Biar artikel baru langsung "muncul" di semua halaman publik
    revalidatePath("/admin/info");
    revalidatePath("/warta");
    revalidatePath("/");

    return NextResponse.json(
      { message: "Warta berhasil diterbitkan! Savage!", data: newInfo },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ API POST ERROR:", error.message);
    
    // Handle error slug duplikat
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "URL/Slug ini sudah ada yang punya. Aris, coba ganti judul sedikit!" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Gagal menyimpan ke database", details: error.message },
      { status: 500 }
    );
  }
}