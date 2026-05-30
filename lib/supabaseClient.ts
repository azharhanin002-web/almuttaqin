import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Singkirkan inisialisasi kaku serverless, buat klien murni untuk browser
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Otomatis simpan sesi login jemaah di LocalStorage
    autoRefreshToken: true,
  },
});