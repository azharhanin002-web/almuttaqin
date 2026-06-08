import { createClient } from "@sanity/client";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2026-06-08", // Menggunakan tanggal hari ini biar up-to-date
  useCdn: false, // Set false agar perubahan jadwal di studio langsung instan ter-update di frontend jemaah
});