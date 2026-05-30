import prisma from "@/lib/prisma";
import { addSchedule, deleteSchedule } from "./actions";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export default async function SchedulesPage() {
  // 1. Ambil data dengan model 'schedule' (tunggal)
  const schedules = await prisma.schedule.findMany({
    orderBy: [
      { day: 'asc' },
      { start_time: 'asc' }
    ],
  });

  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Ahad"];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 text-left">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-emerald-900">Atur Jadwal Siaran ⏰</h1>
          <p className="text-gray-500">Susun program harian untuk Radio Suara Al Muttaqin.</p>
        </header>

        {/* Form Tambah Jadwal */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-100 mb-10">
          <h2 className="text-lg font-bold text-emerald-800 mb-6 flex items-center gap-2">
            <span>➕</span> Tambah Program Baru
          </h2>
          <form action={addSchedule} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nama Program</label>
              <input name="program_name" required placeholder="Murottal Pagi" className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Hari</label>
              <select name="day" className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white">
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Mulai</label>
                <input name="start_time" type="time" required className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Selesai</label>
                <input name="end_time" type="time" required className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95">
                Simpan Jadwal
              </button>
            </div>
          </form>
        </div>

        {/* Tabel Jadwal */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-emerald-900 text-white text-xs uppercase tracking-widest">
              <tr>
                <th className="p-5 font-semibold">Hari</th>
                <th className="p-5 font-semibold">Waktu</th>
                <th className="p-5 font-semibold">Nama Program</th>
                <th className="p-5 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {schedules.map((item) => (
                <tr key={item.id} className="hover:bg-emerald-50/20 transition-all group">
                  <td className="p-5 font-bold text-emerald-900">{item.day}</td>
                  <td className="p-5">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                      {/* PERBAIKAN: Ubah Date ke String dulu baru di-slice */}
                      {String(item.start_time).slice(0, 5)} - {String(item.end_time).slice(0, 5)}
                    </span>
                  </td>
                  <td className="p-5 font-medium text-gray-800">{item.program_name}</td>
                  <td className="p-5 text-center">
                    <form action={async () => {
                      "use server";
                      await deleteSchedule(item.id);
                    }} className="flex justify-center">
                      <button 
                        type="submit"
                        onClick={(e) => { if(!confirm("Hapus jadwal ini?")) e.preventDefault(); }}
                        className="text-gray-300 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                      >
                        🗑️
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {schedules.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-20 text-center text-gray-400 italic">
                    Belum ada jadwal yang diinputkan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}