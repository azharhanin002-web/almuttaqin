"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// 🟢 SOLUSI MUTLAK: Copas langsung token panjang Service Role rahasia antum dari dashboard Vercel/Supabase ke sini
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhc2Zyc3RjZWp1aXB6dHJqaXhpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA0NDk0MywiZXhwIjoyMDk1NjIwOTQzfQ.jWE2626XaKS5YgWQzd8Zo9LzLFzweojPTn3LqWFs5z4"; 

// Membuat client admin bypass RLS tingkat tinggi
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

/**
 * 🚀 FUNGSI KIRIM PESAN DAKWAH (SERVER-SIDE)
 */
export async function sendChatMessage(username: string, message: string) {
  if (!username.trim() || !message.trim()) {
    return { success: false, error: "Nama dan pesan tidak boleh kosong." };
  }

  try {
    // Menembak langsung tembus RLS menggunakan Kunci Master Admin
    const { data, error } = await supabaseAdmin
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
 * 🚀 FUNGSI AMBIL DATA PESAN CHAT KOMUNITAS
 */
export async function getChatMessages() {
  try {
    const { data, error } = await supabaseAdmin
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