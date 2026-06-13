"use client";

import Image from "next/image";
import { Copy, Heart, MessageCircle } from "lucide-react";

interface DonasiSectionProps {
  bsi?: string;
  bri?: string;
  an?: string;
}

export default function DonasiSection({
  bsi = "7120202043",
  bri = "002201028443533",
  an = "Baitul Maal Al Muttaqin",
}: DonasiSectionProps) {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text.replace(/\s/g, ""));
      alert("Nomor rekening berhasil disalin");
    } catch {
      alert("Gagal menyalin nomor rekening");
    }
  };

  const waLink =
    "https://wa.me/6281325182875?text=Assalamualaikum,%20saya%20ingin%20konfirmasi%20donasi%20untuk%20Al%20Muttaqin";

  return (
    <section
      id="donasi"
      className="bg-gradient-to-b from-white via-white to-emerald-50 py-12 md:py-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.68fr] lg:gap-12 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-2">
              <Heart size={14} className="fill-emerald-600 text-emerald-600" />
              <span className="text-xs sm:text-sm font-medium text-emerald-700">
                Infaq & Sedekah Jariyah
              </span>
            </div>

            <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-slate-900">
              Dukung Dakwah
              <span className="block text-emerald-600">
                Al Muttaqin Jepara
              </span>
            </h2>

            <p className="mt-5 text-base md:text-lg leading-relaxed text-slate-600 max-w-xl">
              Donasi yang Anda salurkan akan digunakan untuk mendukung
              operasional Radio Suara Al Muttaqin, kegiatan dakwah, pendidikan,
              serta pengembangan Pondok Pesantren Al Muttaqin.
            </p>

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 font-semibold text-white transition hover:bg-emerald-700"
            >
              <MessageCircle size={18} />
              Konfirmasi via WhatsApp.
            </a>
          </div>

          <div className="w-full max-w-sm space-y-2.5 lg:ml-auto">
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white p-2">
                  <Image
                    src="/bsi.png"
                    alt="BSI"
                    width={72}
                    height={30}
                    className="max-h-7 w-auto object-contain"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-slate-500">
                    Bank Syariah Indonesia
                  </p>

                  <p className="mt-0.5 break-all text-lg sm:text-xl font-black leading-tight tracking-tight text-slate-900">
                    {bsi}
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-500">
                    a.n. {an}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => copyToClipboard(bsi)}
                className="mt-2.5 flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-slate-200 text-[11px] font-medium text-slate-900 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <Copy size={13} />
                Salin Nomor Rekening
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white p-2">
                  <Image
                    src="/bri.png"
                    alt="BRI"
                    width={72}
                    height={30}
                    className="max-h-7 w-auto object-contain"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-slate-500">
                    Bank Rakyat Indonesia
                  </p>

                  <p className="mt-0.5 break-all text-base sm:text-lg md:text-xl font-black leading-tight tracking-tight text-slate-900">
                    {bri}
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-500">
                    a.n. {an}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => copyToClipboard(bri)}
                className="mt-2.5 flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-slate-200 text-[11px] font-medium text-slate-900 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <Copy size={13} />
                Salin Nomor Rekening
              </button>
            </div>

            <div className="rounded-xl bg-emerald-600 p-3.5 text-white shadow-sm">
              <h3 className="text-sm sm:text-base font-bold">
                Jazakumullahu Khairan Katsiran
              </h3>

              <p className="mt-1.5 text-[11px] sm:text-xs leading-relaxed text-emerald-50">
                Semoga Allah membalas setiap rupiah yang Anda infakkan dengan
                keberkahan dunia dan akhirat serta menjadi amal jariyah yang
                terus mengalir pahalanya.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}