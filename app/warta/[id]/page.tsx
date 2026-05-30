"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/router";
import { supabase } from "@/lib/supabaseClient";
import { 
  Loader2, 
  Calendar, 
  User, 
  MessageSquare, 
  ArrowLeft, 
  Send, 
  LogOut, 
  Radio, 
  Clock,
  Share2
} from "lucide-react";

interface Comment {
  id: string;
  user_name: string;
  user_avatar: string;
  content: string;
  created_at: string;
  user_id: string;
}

export default function DetailWartaPage() {
  const { id } = useParams();
  const router = useRouter();

  // State Berita Blogger
  const [post, setPost] = useState<any>(null);
  const [loadingPost, setLoadingPost] = useState(true);
  const [errorPost, setErrorPost] = useState<string | null>(null);

  // State Supabase Auth & Komentar
  const [user, setUser] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (!id) return;

    // 1. Ambil Data Detail Artikel dari Blogger API
    async function fetchDetailPost() {
      const apiKey = process.env.NEXT_PUBLIC_BLOGGER_API_KEY;
      const blogId = process.env.NEXT_PUBLIC_BLOGGER_BLOG_ID;

      try {
        const res = await fetch(
          `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts/${id}?key=${apiKey}`
        );
        if (!res.ok) throw new Error("Artikel tidak ditemukan atau sudah dihapus dari Blogger.");
        const data = await res.json();
        setPost(data);
      } catch (err: any) {
        console.error("💥 Error Detail Fetch:", err);
        setErrorPost(err.message || "Gagal memuat detail artikel.");
      } finally {
        setLoadingPost(false);
      }
    }

    // 2. Ambil Data Komentar dari Supabase yang Berelasi dengan ID Artikel ini
    async function fetchComments() {
      try {
        const { data, error } = await supabase
          .from("comments")
          .select("*")
          .eq("post_id", id)
          .order("created_at", { ascending: true });

        if (error) throw error;
        setComments(data || []);
      } catch (err: any) {
        console.error("💥 Gagal memuat komentar Supabase:", err.message);
      }
    }

    // 3. Cek Status Login Sesi User Saat Ini
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    fetchDetailPost();
    fetchComments();

    return () => subscription.unsubscribe();
  }, [id]);

  // Fungsi Kirim Komentar Baru ke Supabase
  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSubmittingComment(true);

    const commentPayload = {
      post_id: id,
      user_id: user.id,
      user_name: user.user_metadata.full_name || user.user_metadata.name || "Jemaah Anonim",
      user_avatar: user.user_metadata.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      content: newComment.trim(),
    };

    try {
      const { data, error } = await supabase
        .from("comments")
        .insert([commentPayload])
        .select();

      if (error) throw error;

      if (data) {
        setComments([...comments, data[0]]);
        setNewComment("");
      }
    } catch (err: any) {
      alert("Gagal mengirim komentar: " + err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Fungsi Log Out Akun Jemaah
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  if (loadingPost) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-emerald-600" size={36} />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Memuat Artikel Liputan Al Muttaqin...</p>
      </div>
    );
  }

  if (errorPost || !post) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl max-w-md">
          <p className="text-red-500 font-black uppercase text-xs tracking-wider mb-4">💥 ERROR TERJADI</p>
          <p className="text-slate-600 text-sm font-medium mb-6 leading-relaxed">{errorPost}</p>
          <button onClick={() => router.push("/warta")} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
            <ArrowLeft size={14} /> Kembali ke Warta
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white text-left font-sans text-slate-900 antialiased pb-24">
      
      {/* MINI NAVIGATION TOP BAR */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <button 
            onClick={() => router.push("/warta")}
            className="inline-flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-emerald-600 uppercase tracking-widest transition-all"
          >
            <ArrowLeft size={14} strokeWidth={3} /> Beranda Warta
          </button>
          <div className="flex items-center gap-2 text-slate-900 font-black italic text-xs uppercase tracking-tight">
            <Radio size={14} className="text-emerald-500 animate-pulse" /> RSM <span className="text-emerald-500">News</span>
          </div>
        </div>
      </div>

      {/* RENDER UTAMA ARTIKEL Khas Liputan6 Style (Clean, Bold, Focused Middle Column) */}
      <article className="max-w-3xl mx-auto px-4 pt-10">
        
        {/* Kategori Atas */}
        <span className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.2em] bg-emerald-50 px-3 py-1 rounded-full">
          Warta Pondok
        </span>

        {/* Judul Besar Utama */}
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight mt-4 mb-6 uppercase italic">
          {post.title}
        </h1>

        {/* Metadata Penulis & Tanggal (Liputan6 Style Info Box) */}
        <div className="flex flex-wrap items-center justify-between border-y border-slate-100 py-4 mb-8 text-slate-500 text-[11px] font-bold gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                <User size={12} />
              </div>
              <span>Oleh: <span className="text-slate-900">{post.author?.displayName || "Admin Media Center"}</span></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Calendar size={13} />
              <span>{new Date(post.published).toLocaleDateString("id-ID", { dateStyle: "long" })}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
              <Clock size={13} />
              <span>{new Date(post.published).toLocaleTimeString("id-ID", { hour: '2-digit', minute:'2-digit' })} WIB</span>
            </div>
          </div>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Tautan artikel berhasil disalin ke clipboard!");
            }}
            className="text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-1.5"
            title="Bagikan Tautan"
          >
            <Share2 size={14} /> <span className="uppercase text-[9px] tracking-wider">Share</span>
          </button>
        </div>

        {/* ISI ARTIKEL HTML (Rendering murni output rich-text Blogger) */}
        {/* Menggunakan Tailwind @tailwindcss/typography (prose) yang bersih & nyaman di mata */}
        <div 
          className="prose prose-slate max-w-none text-slate-800 leading-relaxed text-sm md:text-base font-medium
            prose-headings:font-black prose-headings:tracking-tight prose-headings:uppercase prose-headings:italic
            prose-p:mb-5 prose-p:leading-relaxed
            prose-img:rounded-[1.5rem] prose-img:shadow-xl prose-img:my-8 prose-img:mx-auto
            prose-a:text-emerald-600 prose-a:font-bold hover:prose-a:text-slate-900"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* ========================================================================= */}
        {/* SEKTOR RUANG KOMENTAR JEMAAH (Supabase Integrated Client Section) */}
        {/* ========================================================================= */}
        <section className="mt-16 pt-10 border-t border-slate-100">
          <h3 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-8">
            <MessageSquare size={18} className="text-emerald-600" /> Ruang Diskusi Jemaah ({comments.length})
          </h3>

          {/* BOX KOORDINASI AUTENTIKASI */}
          {!user ? (
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl text-center mb-8">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wide mb-4">
                Mau ikut berdiskusi memberikan tanggapan, Fal?
              </p>
              <Link
                href="/login"
                className="inline-flex bg-slate-900 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl shadow-md transition-all"
              >
                Masuk Menggunakan Google / GitHub
              </Link>
            </div>
          ) : (
            <div className="bg-emerald-50/40 border border-emerald-100/50 p-4 rounded-2xl flex items-center justify-between mb-8 text-[11px] font-bold">
              <div className="flex items-center gap-2.5">
                <img src={user.user_metadata.avatar_url} alt="" className="w-6 h-6 rounded-full border border-white shadow-sm" />
                <span className="text-slate-700">Masuk sebagai: <span className="text-emerald-700">{user.user_metadata.full_name || user.user_metadata.name}</span></span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 uppercase text-[9px] tracking-widest font-black"
              >
                <LogOut size={12} /> Keluar
              </button>
            </div>
          )}

          {/* FORM INPUT TULIS KOMENTAR (Hanya aktif jika user lolos login Auth) */}
          {user && (
            <form onSubmit={handleSendComment} className="mb-10 space-y-3">
              <textarea
                rows={3}
                required
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Tuliskan komentar atau masukan jemaah yang santun di sini..."
                className="w-full border border-slate-200 p-4 rounded-2xl text-xs font-medium focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 outline-none transition-all leading-relaxed bg-white text-slate-800"
              />
              <div className="text-right">
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="bg-emerald-600 hover:bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] px-5 py-3 rounded-xl transition-all flex items-center gap-2 ml-auto disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {submittingComment ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Send size={12} />
                  )}
                  {submittingComment ? "Mengirim..." : "Kirim Komentar"}
                </button>
              </div>
            </form>
          )}

          {/* RENDERING FEED KOTAK DAFTAR KOMENTAR LIST */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-slate-400 text-xs italic font-medium text-center py-6 border border-dashed border-slate-100 rounded-2xl">
                Belum ada komentar pada warta ini. Jadilah yang pertama memberikan tanggapan!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex gap-4 animate-in fade-in duration-300">
                  <img 
                    src={comment.user_avatar} 
                    alt={comment.user_name} 
                    className="w-9 h-9 rounded-full bg-slate-50 object-cover border border-slate-100 shrink-0" 
                  />
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">{comment.user_name}</h4>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        {new Date(comment.created_at).toLocaleDateString("id-ID", { dateStyle: "short" })}
                      </span>
                    </div>
                    <p className="text-slate-700 text-xs font-medium leading-relaxed whitespace-pre-line">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

        </section>

      </article>
    </main>
  );
}