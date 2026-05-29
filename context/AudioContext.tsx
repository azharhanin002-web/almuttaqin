"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";

interface AudioContextType {
  isPlaying: boolean;
  hasError: boolean;
  metadata: { title: string; artist: string; art: string };
  listeners: number;
  togglePlay: () => void;
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<any>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const isInitialized = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [listeners, setListeners] = useState(0);
  const [metadata, setMetadata] = useState({
    title: "Mencari Sinyal...",
    artist: "Radio Suara Al Muttaqin",
    art: "/bg-player.png",
  });

  // ===============================
  // FETCH METADATA UPDATE JADWAL DARI DATABASE
  // ===============================
  const fetchMetadata = useCallback(async () => {
    try {
      const res = await fetch("/api/get-current-radio", { cache: "no-store" });
      if (!res.ok) throw new Error("Offline");
      const data = await res.json();
      
      if (data && data.active) {
        setMetadata({
          title: data.title || "Siaran Sedang Aktif",
          artist: "Radio Suara Al Muttaqin",
          art: "/bg-player.png",
        });
        setListeners(1);
      } else {
        setMetadata({
          title: "Siaran Sedang Offline",
          artist: "Radio Suara Al Muttaqin",
          art: "/bg-player.png",
        });
        setListeners(0);
      }
    } catch (err) {
      setMetadata({
        title: "Siaran Sedang Offline",
        artist: "Radio Suara Al Muttaqin",
        art: "/bg-player.png",
      });
      setListeners(0);
    }
  }, []);

  useEffect(() => {
    fetchMetadata();
    const interval = setInterval(fetchMetadata, 15000);
    return () => clearInterval(interval);
  }, [fetchMetadata]);

  // ===============================
  // INIT AUDIO ENGINE (WEB AUDIO API)
  // ===============================
  const initAudio = useCallback(() => {
    if (isInitialized.current || !audioRef.current) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      sourceRef.current = source;

      isInitialized.current = true;
      console.log("✅ Audio Engine Virtual Radio RSM Aktif Terpusat");
    } catch (err) {
      console.error("Gagal inisialisasi Audio Engine:", err);
    }
  }, []);

  // ===============================
  // LOGIKA UTAMA MEMUTAR LIVE SYNC
  // ===============================
  const startPlayback = useCallback(async () => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    const audioCtx = audioContextRef.current;

    try {
      const res = await fetch("/api/get-current-radio", { cache: "no-store" });
      const data = await res.json();

      if (data && data.active) {
        // 1. Set alamat file media stream baru dari Hawkhost
        audio.src = data.audio_url;
        audio.load();

        // 2. Tunggu metadata audio termuat sedikit agar browser tahu durasi asli file media tersebut
        await new Promise<void>((resolve) => {
          const onLoadedMetadata = () => {
            audio.removeEventListener("loadedmetadata", onLoadedMetadata);
            resolve();
          };
          audio.addEventListener("loadedmetadata", onLoadedMetadata);
          // Set batas waktu aman jika loading server tujuan lambat
          setTimeout(resolve, 1000);
        });

        // 3. VALIDASI EMAS ANTI-HENING: Lakukan lompatan waktu serempak hanya jika valid
        const targetTime = data.elapsed_seconds || 0;
        if (targetTime > 0 && (!audio.duration || targetTime < audio.duration)) {
          audio.currentTime = targetTime;
        } else {
          // Jika melampaui durasi asli media atau stream mati, putar aman dari awal detik 0
          audio.currentTime = 0;
        }

        // 4. BANGUNKAN CONTEXT ENGINE: Paksa lepas dari status suspended browser
        if (audioCtx) {
          if (audioCtx.state === "suspended") {
            await audioCtx.resume();
          }
        }

        // 5. Eksekusi putar media stream
        await audio.play();
        setIsPlaying(true);
        setHasError(false);
        setMetadata(prev => ({ ...prev, title: data.title })); 
      } else {
        setIsPlaying(false);
      }
    } catch (err) {
      console.error("Gagal memulai playback:", err);
      setHasError(true);
      setIsPlaying(false);
    }
  }, []);

  // SAKELAR TOMBOL PLAY / PAUSE GLOBAL
  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (!isInitialized.current) initAudio();

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.src = ""; 
      audioRef.current.load();
      setIsPlaying(false);
    } else {
      setHasError(false);
      await startPlayback();
    }
  };

  // RE-SYNC OTOMATIS SAAT LAGU SELESAI
  const handleAudioEnded = async () => {
    console.log("🎵 File MP3 selesai diputar. Melompat ke track virtual berikutnya...");
    if (isPlaying) {
      await startPlayback(); 
    }
  };

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch (e) {
          console.error(e);
        }
      }
    };
  }, []);

  return (
    <AudioContext.Provider value={{ isPlaying, hasError, metadata, listeners, togglePlay, analyserRef }}>
      <audio
        ref={audioRef}
        crossOrigin="anonymous" // 🟢 KUNCI UTAMA: Wajib dipasang kembali agar Web Audio API diizinkan bersuara!
        preload="none"
        onPause={() => setIsPlaying(false)}
        onPlay={() => {
          setIsPlaying(true);
          setHasError(false);
        }}
        onEnded={handleAudioEnded}
        onError={() => {
          setHasError(true);
          setIsPlaying(false);
          console.warn("⚠️ Virtual Radio RSM Offline / CORS Issue");
        }}
        className="hidden"
      />
      {children}
    </AudioContext.Provider>
  );
}

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio harus di dalam AudioProvider");
  return context;
};