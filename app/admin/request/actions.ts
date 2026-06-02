"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase environment variables belum lengkap.");
  }

  return createClient(url, serviceRoleKey);
}

/**
 * Tandai request sebagai sudah diputar
 */
export async function markPlayed(id: string) {
  try {
    const supabase = getSupabase();

    const { error } = await supabase
      .from("song_requests")
      .update({
        status: "played",
      })
      .eq("id", id);

    if (error) {
      console.error("❌ Gagal update status:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath("/admin/request");

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("❌ markPlayed Error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Kembalikan request ke status pending
 */
export async function markPending(id: string) {
  try {
    const supabase = getSupabase();

    const { error } = await supabase
      .from("song_requests")
      .update({
        status: "pending",
      })
      .eq("id", id);

    if (error) {
      console.error("❌ Gagal update status:", error);

      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath("/admin/request");

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("❌ markPending Error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Hapus request
 */
export async function deleteRequest(id: string) {
  try {
    const supabase = getSupabase();

    const { error } = await supabase
      .from("song_requests")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("❌ Gagal menghapus request:", error);

      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath("/admin/request");

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("❌ deleteRequest Error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}