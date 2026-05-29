import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // 1. AMBIL DATA DARI REQUEST BODY CRON-JOB
    const body = await request.json();
    const { title, mp3_url, duration, duration_seconds } = body;

    console.log("📥 Menerima Trigger Jadwal Baru:", body);

    // 2. VALIDASI INPUT DATA UTAMA
    if (!title || !mp3_url) {
      return NextResponse.json(
        { error: "Judul (title) dan URL Audio (mp3_url) wajib diisi!" },
        { status: 400 }
      );
    }

    // 3. AMANKAN KONVERSI DURASI (Membaca fleksibel dari duration atau duration_seconds)
    const finalDuration = parseInt(duration || duration_seconds || "0", 10);

    if (isNaN(finalDuration) || finalDuration <= 0) {
      return NextResponse.json(
        { error: "Durasi tidak valid! Harus berupa angka detik yang lebih dari 0." },
        { status: 400 }
      );
    }

    // 4. BERSIHKAN / FLUSH JADWAL LAMA AGAR TIDAK MENUMPUK DI DATABASE
    // Menggunakan deleteMany untuk memastikan tabel bersih sebelum siaran baru masuk
    await prisma.radioStream.deleteMany();

    // 5. MASUKKAN JADWAL SIARAN BARU YANG SEREMPAK
    const newStream = await prisma.radioStream.create({
      data: {
        title: title,
        audio_url: mp3_url,
        duration: finalDuration, // Masuk ke kolom database 'duration' sesuai skema prisma antum
        start_time: new Date(),  // Detik ini dihitung sebagai waktu start live sync dunia nyata!
      },
    });

    console.log("✅ Berhasil Memperbarui Virtual Stream Database:", newStream);

    return NextResponse.json({
      success: true,
      message: `Jadwal program '${title}' berhasil diaktifkan secara live!`,
      data: newStream
    }, { status: 200 });

  } catch (error: any) {
    console.error("💥 Eror fatal pada API radio-trigger:", error);
    
    // Kembalikan detail pesan eror agar terbaca jelas di dashboard cron-job.org jika gagal lagi
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Internal Server Error pada sistem API rute.",
        meta: error.code || null
      },
      { status: 500 }
    );
  }
}