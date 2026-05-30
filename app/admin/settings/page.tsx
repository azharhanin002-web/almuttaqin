"use client";

import { useState } from "react";
import { Settings, Radio, Database, Sliders, Save, RefreshCcw } from "lucide-react";

// 🟢 MANTRA KEAMANAN NEXT.JS: Menjamin Turbopack meloloskan halaman pengaturan tanpa static freeze pas build
export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const [saveLoading, setSaveLoading] = useState(false);
  const [streamUrl, setStreamUrl] = useState("https://sdit.my.id/radio/stream.mp3");
  const [maxRequests, setMaxRequests] = useState("5");

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    
    // Simulasi pengetukan API internal pembawa parameter konfigurasi
    setTimeout(() => {
      setSaveLoading(false);
      alert("✅ Konfigurasi Virtual Auto DJ berhasil diperbarui!");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4 md:px-6 text-left font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER - Gaya Tajam Miring Khas RSM */}
        <div className="mb-10 border-l-4 border-emerald-600 pl-5">
          <p className="text-[9px] font-black tracking-[0.3em] text-emerald-600 mb-2 uppercase">
            Sistem Administrasi Pusat
          </p>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 uppercase italic tracking-tighter flex items-center gap-3">
            Konfigurasi Sistem <Settings className="text-emerald-600 shrink-0" size={28} />
          </h1>
        </div>

        <form onSubmit={handleSaveSettings} className="grid gap-6">
          
          {/* =========================================================
              SEKSI 1: IDENTITAS STASIUN RADIO
              ========================================================= */}
          <div className="bg-white border border-slate-100 rounded-[4px] p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-[4px]">
                <Radio size={18} />
              </div>
              <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Identitas Stasiun Utama</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">Nama Stasiun</label>
                <input 
                  type="text" 
                  defaultValue="Radio Suara Al Muttaqin"
                  className="w-full bg-slate-50 border border-slate-200 rounded-[4px] p-3 text-sm font-bold text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">Lokasi Regional Stasiun</label>
                <input 
                  type="text" 
                  defaultValue="Purwokerto // Central Java"
                  className="w-full bg-slate-50 border border-slate-200 rounded-[4px] p-3 text-sm font-bold text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">Tagline Utama</label>
              <input 
                type="text" 
                defaultValue="Media Dakwah Penyejuk Hati, Menginspirasi Sanubari Menuju Ridho Ilahi"
                className="w-full bg-slate-50 border border-slate-200 rounded-[4px] p-3 text-sm font-bold text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          {/* =========================================================
              SEKSI 2: INTEGRASI CONFIG VIRTUAL AUTO DJ (PENGGANTI AZURACAST)
              ========================================================= */}
          <div className="bg-white border border-slate-100 rounded-[4px] p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-[4px]">
                <Database size={18} />
              </div>
              <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Integrasi Virtual Auto DJ Hub</h2>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">URL Sumber Audio Streaming (.mp3 / Hawkhost Source)</label>
              <input 
                type="url" 
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-[4px] p-3 text-sm font-mono text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all"
                placeholder="https://domain-hosting.com/radio/stream.mp3"
                required
              />
              <p className="text-[10px] text-slate-400 font-medium">Jalur tautan statis audio yang akan dikonsumsi oleh HTML5 Audio Global di sisi jemaah.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">Limit Antrean Request Harian (Per User)</label>
                <input 
                  type="number" 
                  value={maxRequests}
                  onChange={(e) => setMaxRequests(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-[4px] p-3 text-sm font-bold text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all"
                  min="1"
                  max="20"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">Status Sinkronisasi Jadwal Cron-Job</label>
                <div className="w-full bg-emerald-50 border border-emerald-100 rounded-[4px] p-3 text-xs font-mono font-bold text-emerald-800 flex items-center justify-between">
                  <span>STATUS: ACTIVE (OK)</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================
              TOMBOL SIMPAN SETTINGS
              ========================================================= */}
          <div className="pt-4 flex justify-end">
            <button 
              type="submit" 
              disabled={saveLoading}
              className={`
                px-10 py-3.5 rounded-[4px] font-black text-[11px] uppercase tracking-widest 
                transition-all duration-300 active:scale-95 cursor-pointer select-none border-b-4 flex items-center gap-2
                ${saveLoading 
                  ? "bg-slate-300 text-slate-500 border-slate-400 cursor-not-allowed" 
                  : "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-800 shadow-[0_10px_20px_-5px_rgba(16,185,129,0.3)]"
                }
              `}
            >
              {saveLoading ? (
                <>Menyimpan... <RefreshCcw size={14} className="animate-spin" /></>
              ) : (
                <>Simpan Perubahan <Save size={14} /></>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}