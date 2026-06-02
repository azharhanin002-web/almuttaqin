"use server";

import { createClient } from "@supabase/supabase-js";

export async function submitRequest(formData: FormData) {
  try {
    const name = String(formData.get("name") || "").trim();
    const category = String(formData.get("category") || "").trim();
    const song_title = String(formData.get("song_title") || "").trim();
    const message = String(formData.get("message") || "").trim();

    // Validasi sederhana
    if (!name || !category || !song_title) {
      return {
        success: false,
        error: "Data wajib belum lengkap.",
      };
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from("song_requests")
      .insert({
        name,
        category,
        song_title,
        message: message || null,
        status: "pending",
      });

    if (error) {
      console.error("Supabase Insert Error:", error);

      return {
        success: false,
        error: "Gagal menyimpan request.",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Submit Request Error:", error);

    return {
      success: false,
      error: "Terjadi kesalahan pada server.",
    };
  }
}