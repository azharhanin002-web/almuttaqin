import { createClient } from "@supabase/supabase-js";
import { markPlayed, deleteRequest } from "./actions";
import {
  Music,
  Clock3,
  CheckCircle2,
  Trash2,
  Radio,
} from "lucide-react";

async function getRequests() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("song_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
}

export default async function AdminRequestPage() {
  const requests = await getRequests();

  const pending = requests.filter(
    (r) => r.status === "pending"
  ).length;

  const played = requests.filter(
    (r) => r.status === "played"
  ).length;

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold">
            <Radio size={16} />
            Dashboard Penyiar
          </div>

          <h1 className="mt-4 text-4xl font-black text-slate-900">
            🎙 Request Siaran
          </h1>

          <p className="text-slate-500 mt-2">
            Kelola request nasyid, murottal, dan ceramah.
          </p>
        </div>

        {/* STATISTIK */}

        <div className="grid md:grid-cols-3 gap-4 mb-8">

          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <p className="text-slate-500 text-sm">
              Total Request
            </p>

            <h2 className="text-4xl font-black mt-2">
              {requests.length}
            </h2>
          </div>

          <div className="bg-yellow-50 rounded-3xl p-6 border border-yellow-200">
            <p className="text-yellow-700 text-sm">
              Pending
            </p>

            <h2 className="text-4xl font-black text-yellow-700 mt-2">
              {pending}
            </h2>
          </div>

          <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-200">
            <p className="text-emerald-700 text-sm">
              Sudah Diputar
            </p>

            <h2 className="text-4xl font-black text-emerald-700 mt-2">
              {played}
            </h2>
          </div>

        </div>

        {/* EMPTY STATE */}

        {requests.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center">
            <Music
              size={60}
              className="mx-auto text-slate-300 mb-4"
            />

            <h2 className="font-black text-xl text-slate-700">
              Belum Ada Request
            </h2>

            <p className="text-slate-500 mt-2">
              Request dari santri akan muncul di sini.
            </p>
          </div>
        )}

        {/* LIST REQUEST */}

        <div className="grid gap-4">

          {requests.map((item: any) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                {/* KONTEN */}

                <div className="flex-1">

                  <div className="flex flex-wrap items-center gap-2 mb-3">

                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                      {item.category}
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : item.status === "played"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.status}
                    </span>

                  </div>

                  <h2 className="text-2xl font-black text-slate-900">
                    {item.song_title}
                  </h2>

                  <p className="mt-1 text-slate-500">
                    Request dari{" "}
                    <span className="font-bold">
                      {item.name}
                    </span>
                  </p>

                  {item.message && (
                    <div className="mt-4 bg-slate-50 rounded-2xl p-4 text-slate-700">
                      {item.message}
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                    <Clock3 size={14} />

                    {new Date(
                      item.created_at
                    ).toLocaleString("id-ID")}
                  </div>

                </div>

                {/* ACTION */}

                <div className="flex gap-2">

                  {item.status !== "played" && (
                    <form
                      action={async () => {
                        "use server";
                        await markPlayed(item.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700"
                      >
                        <CheckCircle2 size={16} />
                        Diputar
                      </button>
                    </form>
                  )}

                  <form
                    action={async () => {
                      "use server";
                      await deleteRequest(item.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-4 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700"
                    >
                      <Trash2 size={16} />
                      Hapus
                    </button>
                  </form>

                </div>

              </div>
            </div>
          ))}

        </div>
      </div>
    </main>
  );
}