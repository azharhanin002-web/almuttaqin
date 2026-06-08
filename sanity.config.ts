"use client"; //

import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";

// 🟢 JALUR AKURAT: Sesuai folder Windows asli antum yang berada di dalam folder sanity
import { schemaTypes } from "./sanity/schemaTypes"; 

export default defineConfig({
  name: "default",
  title: "Radio Al Muttaqin Studio",

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "ganti_pake_id_proyek_sanity_antum",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",

  basePath: "/studio", 

  plugins: [deskTool()],

  schema: {
    types: schemaTypes,
  },
});