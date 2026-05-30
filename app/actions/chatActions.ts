"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * FUNGSI INTI: Menginisialisasi Supabase Client berbasis Server (SSR)
 * Memastikan kuki sesi login Google/GitHub jemaah ikut terbawa ke database
 */
async function getSupabaseServer() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Abaikan jika dipanggil dari Server Component yang bersifat read-only
          }
        },
      },
    }
  );
}

/**
 * FUNGSI KIRIM PESAN DAKWAH (SERVER-SIDE)
 * Terintegrasi penuh dengan keamanan RLS Supabase Auth
 */
export async function sendChatMessage(username: string, message: string) {
  if (!username.trim() || !message.trim()) {
    return { success: false, error: "Nama dan pesan tidak boleh kosong." };
  }

  try {
    const supabase = await getSupabaseServer();

    // 🚀 TEMBAK KE TABEL YANG SAMA DENGAN REALTIME: chat_messages
    const { data, error } = await supabase
      .from("chat_messages")
      .insert([
        {
          username: username.trim(),
          message: message.trim(),
          created_at: new Date().toISOString(),
        }
      ])
      .select();

    if (error) {
      console.error("💥 Supabase Insert Error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data[0] };
  } catch (error: any) {
    console.error("💥 Database Insert Error:", error);
    return { success: false, error: "Gagal menyuntikkan pesan ke database." };
  }
}

/**
 * FUNGSI AMBIL DATA PESAN CHAT KOMUNITAS
 */
export async function getChatMessages() {
  try {
    const supabase = await getSupabaseServer();

    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(50);

    if (error) {
      console.error("💥 Supabase Fetch Error Chat:", error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("💥 Fetch Error Chat:", error);
    return [];
  }
}