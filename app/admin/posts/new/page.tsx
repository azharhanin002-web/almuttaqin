"use client";

import { useState } from "react";
import { generateSlug } from "@/lib/slug";

// 🟢 MANTRA KEAMANAN NEXT.JS: Mencegah Turbopack melakukan optimasi static render kaku pada form admin pas build
export const dynamic = "force-dynamic";

export default function NewPostPage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setTitle(value);

    // Otomatis menghasilkan slug ramah SEO dari input judul
    const autoSlug = generateSlug(value);
    setSlug(autoSlug);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || loading) return;

    setLoading(true);

    try {
      // 🟢 SINKRONISASI API: Menembak endpoint API internal warta/info yang terhubung ke Supabase
      const res = await fetch("/api/warta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim()
        })
      });

      if (res.ok) {
        alert("✅ Artikel warta berhasil dibuat!");
        setTitle("");
        setSlug("");
      } else {
        const data = await res.json();
        alert("❌ Gagal membuat artikel: " + (data.message || "Terjadi kesalahan internal"));
      }
    } catch (error) {
      console.error("💥 Gagal memproses penyimpanan artikel baru:", error);
      alert("❌ Terjadi kesalahan jaringan server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4 text-left font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* HEADER FORM - Menggunakan identitas visual tajam RSM */}
        <div className="mb-10 border-l-4 border-emerald-600 pl-5">
          <p className="text-[9px] font-black tracking-[0.3em] text-emerald-600 mb-2 uppercase">
            Panel Kontrol Redaksi
          </p>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 uppercase italic tracking-tighter">
            Buat Artikel Baru
          </h1>
        </div>

        {/* FORM CONTAINER */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-100 rounded-[4px] p-6 md:p-8 shadow-sm space-y-6"
        >
          {/* INPUT JUDUL ARTIKEL */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
              Judul Artikel Warta
            </label>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-[4px] p-3 text-sm text-slate-800 font-medium outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all"
              placeholder="Masukkan judul kabar pondok terbaru..."
              required
            />
          </div>

          {/* INPUT SLUG URL */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
              Slug URL Kustom
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(generateSlug(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-[4px] p-3 text-sm font-mono text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all"
              placeholder="slug-url-otomatis"
              required
            />
            {/* 🟢 FIX JALUR PRATINJAU: Disesuaikan dengan struktur subfolder publik asli kita */}
            <p className="text-[10px] text-slate-400 font-medium pt-1">
              Pratinjau tautan: <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-[2px]">/warta/{slug || "..."}</span>
            </p>
          </div>

          {/* TOMBOL SUBMIT - Aksen Emerald Solid */}
          <div className="pt-4 border-t border-slate-50 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`
                px-10 py-3.5 rounded-[4px] font-black text-[11px] uppercase tracking-widest 
                transition-all duration-300 active:scale-95 cursor-pointer select-none border-b-4
                ${loading 
                  ? "bg-slate-300 text-slate-500 border-slate-400 cursor-not-allowed" 
                  : "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-800 shadow-[0_10px_20px_-5px_rgba(16,185,129,0.3)]"
                }
              `}
            >
              {loading ? "Menyimpan..." : "Simpan Artikel"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}