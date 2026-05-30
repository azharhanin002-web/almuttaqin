import prisma from "@/lib/prisma";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import AdminMapWrapper from "@/components/AdminMapWrapper";
import ListenerTable from "@/components/ListenerTable";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export default async function AdminDashboard() {
  // 1. QUERY DATABASE PARALEL
  const [totalRequests, pendingRequests, totalInfo] =
    await Promise.all([
      prisma.songRequest.count(),
      prisma.songRequest.count({
        where: { status: "pending" },
      }),
      prisma.info.count(),
    ]);

  // 2. FETCH REALTIME AZURACAST (STATION: SALAAM)
  let activeListeners = 0;
  let nowPlaying = "Offline / No Song";
  const baseUrl = process.env.AZURACAST_BASE_URL || "https://rsm.my.id";

  try {
    const res = await fetch(
      `${baseUrl}/api/nowplaying/salaam`,
      { 
        next: { revalidate: 15 },
        headers: { "Accept": "application/json" }
      }
    );
    
    if (res.ok) {
      const data = await res.json();
      activeListeners = data?.listeners?.current || 0;
      nowPlaying = data?.now_playing?.song?.text || "No Song Playing";
    }
  } catch (error) {
    console.error("Gagal ambil data AzuraCast:", error);
  }

  const stats = [
    { name: "Total Request", value: totalRequests, icon: "🎵", color: "bg-blue-500" },
    { name: "Request Pending", value: pendingRequests, icon: "⏳", color: "bg-orange-500" },
    { name: "Info Terbit", value: totalInfo, icon: "📢", color: "bg-emerald-500" },
    { name: "Pendengar Aktif", value: activeListeners, icon: "🎧", color: "bg-purple-500 animate-pulse" },
  ];

  const menus = [
    { title: "Kelola Request", desc: "Lihat dan proses salam dari pendengar setia", href: "/admin/requests", icon: "📩" },
    { title: "Pengelolaan Info", desc: "Update berita pondok dan informasi siaran", href: "/admin/info", icon: "📢" },
    { title: "Pengaturan Utama", desc: "Konfigurasi sistem radio pondok", href: "/admin/settings", icon: "⚙️" },
    { title: "Statistik", desc: "Analisis pendengar dan tren request", href: "/admin/stats", icon: "📊" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-emerald-900 tracking-tight uppercase italic">
              Dashboard Utama 🏰
            </h1>
            <p className="text-emerald-600 mt-1 font-medium italic">
              Live: <span className="text-emerald-950 font-black ml-2">{nowPlaying}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-white border border-emerald-200 rounded-2xl text-emerald-700 font-black hover:bg-emerald-50 transition-all shadow-sm active:scale-95 text-[10px] uppercase tracking-widest"
            >
              🌐 Website Utama
            </Link>
            <LogoutButton />
          </div>
        </div>

        {/* ================= STATS GRID ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((item) => (
            <div key={item.name} className="bg-white rounded-[2rem] p-7 shadow-sm border border-gray-100 flex items-center gap-6 hover:shadow-md transition-all">
              <div className={`${item.color} w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg text-white`}>
                {item.icon}
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{item.name}</p>
                <p className="text-4xl font-black text-gray-900 leading-none mt-1">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ================= MAP SECTION ================= */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-emerald-100 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black text-emerald-900 uppercase tracking-[0.2em] italic flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              Sebaran Pendengar Aktif Radio Al Muttaqin 🌍
            </h3>
          </div>
          <div className="h-96 w-full rounded-3xl overflow-hidden border border-gray-100 relative z-0">
            <AdminMapWrapper />
          </div>
        </div>

        {/* ================= LISTENER TABLE SECTION ================= */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-emerald-100 shadow-sm mb-14 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black text-emerald-900 uppercase tracking-[0.2em] italic flex items-center gap-3">
              Rincian Lokasi Pendengar Radio Al Muttaqin 🗺️
            </h3>
          </div>
          {/* Komponen Client untuk Auto-update Tabel */}
          <ListenerTable />
        </div>

        {/* ================= MENU GRID ================= */}
        <h2 className="text-xl font-black text-emerald-950 mb-8 flex items-center gap-3 uppercase tracking-tighter italic">
          <span className="bg-emerald-100 p-2 rounded-lg text-lg">🛠️</span>
          Menu Kendali Admin
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {menus.map((menu) => (
            <Link key={menu.href} href={menu.href} className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-emerald-300 transition-all flex items-start gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-all blur-3xl" />
              <div className="text-5xl group-hover:scale-110 transition-transform bg-emerald-50 p-6 rounded-[2rem] relative z-10">{menu.icon}</div>
              <div className="flex-1 relative z-10 pt-2">
                <h3 className="text-xl font-black text-gray-900 group-hover:text-emerald-800 transition-colors uppercase tracking-tight">{menu.title}</h3>
                <p className="text-gray-500 text-sm mt-2 font-medium leading-relaxed">{menu.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-20 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.4em]">
            Radio Suara Al Muttaqin • Jepara, Jawa Tengah
          </p>
        </div>
      </div>
    </div>
  );
}