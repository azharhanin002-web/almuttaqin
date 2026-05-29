import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { crypto } from "crypto"; // Library bawaan Node.js untuk membuat UUID aman

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, mp3_url, duration, duration_seconds } = body;

    console.log("📥 Menerima Request Body:", body);

    if (!title || !mp3_url) {
      return NextResponse.json(
        { error: "Parameter 'title' dan 'mp3_url' wajib dikirim!" },
        { status: 400 }
      );
    }

    // Konversi durasi secara fleksibel dan aman
    const finalDuration = parseInt(duration || duration_seconds || "0", 10);
    if (isNaN(finalDuration) || finalDuration <= 0) {
      return NextResponse.json(
        { error: "Durasi wajib berupa angka detik valid!" },
        { status: 400 }
      );
    }

    // 🧹 1. Bersihkan tabel dengan penanganan eror mandiri
    try {
      await prisma.radioStream.deleteMany({});
    } catch (dbErr) {
      console.warn("⚠️ Gagal melakukan flush data lama (kemungkinan tabel masih kosong):", dbErr);
    }

    // 📥 2. Insert data baru dengan ID buatan Next.js (Anti-Gagal UUID database)
    const generatedId = crypto.randomUUID(); // Membuat string UUID standar secara instan

    const newStream = await prisma.radioStream.create({
      data: {
        id: generatedId, // Paksa isi ID dari sini agar database tidak pusing menghitung uuid
        title: title,
        audio_url: mp3_url,
        duration: finalDuration,
        start_time: new Date(), // Menandai detik siaran dimulai serempak sekarang
      },
    });

    return NextResponse.json({
      success: true,
      message: "Jadwal berhasil diperbarui ke database!",
      data: newStream
    }, { status: 200 });

  } catch (error: any) {
    console.error("💥 CRASH FATAL PADA API TRIGGER:", error);
    
    // 💡 INI PENTING: Mengembalikan teks kesalahan asli ke cron-job agar kita tahu persis letak rusaknya
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Internal Server Error",
        prismaCode: error.code || null,
        stack: error.stack || null
      },
      { status: 500 }
    );
  }
}