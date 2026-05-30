"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Pencil,
  Trash2,
  Loader2,
  Plus,
  MessageSquareDashed,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export default function InfoPage() {
  const [infos, setInfos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/info?t=${Date.now()}`, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Gagal mengambil data dari server");

      const data = await res.json();
      setInfos(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Gagal load data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Yakin mau menghapus warta: "${title}"?`)) return;

    setDeletingId(id);

    try {
      const res = await fetch(`/api/info/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setInfos((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert("Gagal menghapus. Cek log server.");
      }
    } catch {
      alert("Gagal menghapus koneksi terputus.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading)
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">
          Mensinkronkan Database RSM...
        </p>
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto text-left">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-slate-900 p-8 rounded-[4px] shadow-2xl border-b-4 border-emerald-500 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 translate-x-10 -translate-y-10">
          <FileText size={200} />
        </div>

        <div className="relative z-10">
          <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">
            Manajemen <span className="text-emerald-400">Warta Pondok</span>
          </h1>

          {/* FIX HYDRATION ERROR */}
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
            Total {infos.length} Berita Terarsip
          </p>
        </div>

        <Link
          href="/admin/info/create"
          className="relative z-10 bg-emerald-600 hover:bg-white hover:text-emerald-600 text-white px-8 py-4 rounded-[4px] text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-xl active:scale-95"
        >
          <Plus size={16} /> Tambah Warta Baru
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-3 rounded-[4px]">
          <AlertCircle size={20} />
          <p className="text-xs font-bold uppercase tracking-wide">
            Error: {error}
          </p>
        </div>
      )}

      {/* EMPTY STATE */}
      {infos.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-100 rounded-[4px] py-32 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
            <MessageSquareDashed size={40} />
          </div>

          <h3 className="text-slate-900 font-black uppercase italic tracking-tight text-lg">
            Belum Ada Warta
          </h3>

          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 max-w-xs leading-relaxed">
            Daftar berita masih kosong atau sedang bermasalah. Coba tambahkan
            berita baru atau cek koneksi Supabase.
          </p>

          <button
            onClick={fetchData}
            className="mt-8 text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:underline"
          >
            Refresh Data ↻
          </button>
        </div>
      ) : (
        /* TABEL DATA */
        <div className="bg-white border border-slate-100 rounded-[4px] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 uppercase text-[10px] font-black tracking-widest text-slate-500">
                  <th className="p-6">Detail Warta</th>
                  <th className="p-6">Kategori</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-right">Aksi Manajemen</th>
                </tr>
              </thead>

              <tbody>
                {infos.map((info) => (
                  <tr
                    key={info.id}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-all group"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        {info.thumbnail && (
                          <div className="w-12 h-12 rounded-[4px] overflow-hidden border border-slate-100 shrink-0">
                            <img
                              src={info.thumbnail}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          </div>
                        )}

                        <div>
                          <p className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-emerald-600 transition-colors">
                            {info.title}
                          </p>

                          <Link
                            href={`/warta/${info.slug}`}
                            target="_blank"
                            className="text-[9px] text-slate-400 italic hover:text-blue-500 flex items-center gap-1 mt-1"
                          >
                            <ExternalLink size={10} /> /{info.slug}
                          </Link>
                        </div>
                      </div>
                    </td>

                    <td className="p-6">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[9px] font-black uppercase rounded-full border border-slate-200">
                        {info.category?.name || "Umum"}
                      </span>
                    </td>

                    <td className="p-6">
                      <span
                        className={`px-3 py-1 text-[9px] font-black uppercase rounded-full border ${
                          info.status === "publish" ||
                          info.status === "published"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}
                      >
                        {info.status === "publish" ||
                        info.status === "published"
                          ? "🟢 LIVE"
                          : "🟡 DRAFT"}
                      </span>
                    </td>

                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-3">
                        <Link
                          href={`/admin/info/${info.id}/edit`}
                          className="p-3 bg-slate-900 text-emerald-400 rounded-[4px] hover:bg-emerald-600 hover:text-white transition-all shadow-lg active:scale-90"
                        >
                          <Pencil size={14} />
                        </Link>

                        <button
                          onClick={() => handleDelete(info.id, info.title)}
                          disabled={deletingId === info.id}
                          className="p-3 bg-white text-red-500 border border-red-100 rounded-[4px] hover:bg-red-600 hover:text-white transition-all disabled:opacity-50 shadow-sm active:scale-90"
                        >
                          {deletingId === info.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function FileText({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}