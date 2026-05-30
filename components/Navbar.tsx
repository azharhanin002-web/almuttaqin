"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { LogIn, LogOut, Loader2, Heart, Menu, X } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Beranda", path: "/" },
    { name: "Warta", path: "/warta" },
    { name: "Jadwal", path: "/jadwal" },
    { name: "Komunitas", path: "/komunitas" },
  ];

  useEffect(() => {
    // 🟢 SINKRONISASI SESI SUPABASE: Ambil status login jemaah secara instan & real-time
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoadingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoadingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    setLoadingAuth(true);
    await supabase.auth.signOut();
    setIsMenuOpen(false);
    router.refresh();
  };

  // Ekstrak nama panggilan jemaah untuk sapaan hangat di menu mobile
  const getShortName = () => {
    if (!user) return "";
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || "Jemaah";
    return fullName.split(" ")[0];
  };

  // Ekstrak foto profil avatar asli dari Google / GitHub
  const getAvatarUrl = () => {
    return user?.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
  };

  return (
    <header className="sticky top-0 z-[100] w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_15px_50px_rgba(0,0,0,0.05)] transition-all duration-300 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
        
        {/* LOGO SECTION */}
        <div className="flex flex-col">
          <Link href="/" className="group flex items-center gap-2 md:gap-3">
            <span className="text-xl md:text-2xl transition-transform duration-300 group-hover:rotate-12">
              🎙️
            </span>
            <div className="flex flex-col text-left">
              <h1 className="text-sm md:text-lg font-black text-slate-900 uppercase italic leading-none tracking-tighter">
                Radio Suara <span className="text-emerald-600">Al Muttaqin</span>
              </h1>
              <p className="text-[8px] md:text-[10px] text-emerald-600/80 font-bold uppercase tracking-[0.15em] mt-1">
                Menginspirasi hati, menguatkan iman
              </p>
            </div>
          </Link>
        </div>

        {/* DESKTOP NAV LINKS */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className="text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-600 transition-colors relative group"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-emerald-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </nav>

        {/* ACTIONS SECTION (DESKTOP) */}
        <div className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-100">
          <Link
            href="/donasi"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-[4px] text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-100 active:scale-95"
          >
            <Heart size={12} fill="currentColor" /> Donasi
          </Link>

          {loadingAuth ? (
            <div className="w-9 h-9 flex items-center justify-center">
              <Loader2 className="animate-spin text-slate-300" size={16} />
            </div>
          ) : user ? (
            // 🟢 TAMPILAN BERUBAH LOGOUT: Aktif jika jemaah terdeteksi sudah login via Supabase
            <div className="flex items-center gap-2.5 animate-in fade-in duration-300">
              <div className="relative w-8 h-8 rounded-[4px] overflow-hidden border border-slate-200">
                <img 
                  src={getAvatarUrl()} 
                  alt="User Avatar" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
                  }}
                />
              </div>
              <button 
                onClick={handleLogout} 
                title={`Logout (${getShortName()})`}
                className="flex items-center gap-1.5 bg-red-50 hover:bg-red-600 text-red-500 hover:text-white px-3 py-2 rounded-[4px] text-[9px] font-black uppercase tracking-widest transition-all border border-red-100/50"
              >
                <LogOut size={11} strokeWidth={2.5} /> Logout
              </button>
            </div>
          ) : (
            // TAMPILAN RED LOGIN: Aktif jika jemaah murni tamu/anonim
            <Link 
              href="/login"
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-[4px] text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-100 active:scale-95 animate-in fade-in duration-300"
            >
              <LogIn size={12} strokeWidth={3} /> Login
            </Link>
          )}
        </div>

        {/* HAMBURGER BUTTON (MOBILE) */}
        <button 
          className="md:hidden p-2 text-slate-900 focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 p-6 space-y-6 animate-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col gap-4">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => setIsMenuOpen(false)}
                className="text-xs font-black uppercase tracking-[0.2em] text-slate-600 border-b border-slate-50 pb-2 text-left"
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          <div className="flex flex-col gap-3 pt-4">
            <Link
              href="/donasi"
              onClick={() => setIsMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-4 rounded-[4px] text-[10px] font-black uppercase tracking-widest shadow-md"
            >
              <Heart size={14} fill="currentColor" /> Donasi Sekarang
            </Link>
            
            {loadingAuth ? (
              <div className="w-full py-4 flex items-center justify-center">
                <Loader2 className="animate-spin text-slate-300" size={20} />
              </div>
            ) : !user ? (
              <Link 
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-4 rounded-[4px] text-[10px] font-black uppercase tracking-widest shadow-md"
              >
                <LogIn size={14} /> Login Jamaah
              </Link>
            ) : (
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-4 rounded-[4px] text-[10px] font-black uppercase tracking-widest border border-red-100/40"
              >
                <LogOut size={14} /> Logout ({getShortName()})
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}