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
  togglePlay: (play?: boolean) => void;
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  isYouTubeLive: boolean;
  setIsYouTubeLive: React.Dispatch<React.SetStateAction<boolean>>;
  isYouTubePlaying: boolean;
  setIsYouTubePlaying: React.Dispatch<React.SetStateAction<boolean>>;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const isInitialized = useRef(false);
  const lastSyncedUrlRef = useRef("");
  const userStoppedRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [listeners, setListeners] = useState(0);
  const [metadata, setMetadata] = useState({
    title: "Mencari Sinyal...",
    artist: "Radio Suara Al Muttaqin",
    art: "/bg-player.png",
  });

  const [isYouTubeLive, setIsYouTubeLive] = useState(false);
  const [isYouTubePlaying, setIsYouTubePlaying] = useState(false);

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
      console.log("Audio Engine Virtual Radio Aktif");
    } catch (err) {
      console.error("Gagal inisialisasi Audio Engine:", err);
    }
  }, []);

  const fetchCurrentRadio = useCallback(async () => {
    const res = await fetch("/api/get-current-radio", { cache: "no-store" });
    if (!res.ok) throw new Error("Radio API offline");
    return res.json();
  }, []);

  const applyRadioDataToAudio = useCallback(
    async (data: any, forceReload = false) => {
      if (!audioRef.current || !data?.active || !data.audio_url) return false;

      // Stop MP3 jika YouTube Live sedang dimainkan
      if (isYouTubeLive && isYouTubePlaying) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.load();
        setIsPlaying(false);
        return false;
      }

      const audio = audioRef.current;
      const audioCtx = audioContextRef.current;
      const nextSrc = new URL(data.audio_url, window.location.href).href;
      const currentSrc = audio.src;

      const shouldReload = forceReload || currentSrc !== nextSrc || lastSyncedUrlRef.current !== nextSrc;

      setMetadata({
        title: data.title || "Siaran Sedang Aktif",
        artist: "Radio Suara Al Muttaqin",
        art: "/bg-player.png",
      });
      setListeners(1);

      if (!shouldReload) return true;

      try {
        audio.src = data.audio_url;
        audio.load();

        await new Promise<void>((resolve) => {
          const onLoaded = () => {
            audio.removeEventListener("loadedmetadata", onLoaded);
            resolve();
          };
          audio.addEventListener("loadedmetadata", onLoaded);
          setTimeout(resolve, 1200);
        });

        if (audioCtx && audioCtx.state === "suspended") await audioCtx.resume();
        await audio.play();

        lastSyncedUrlRef.current = nextSrc;
        setIsPlaying(true);
        setHasError(false);
        return true;
      } catch (err) {
        console.error("Gagal memutar MP3:", err);
        setHasError(true);
        return false;
      }
    },
    [isYouTubeLive, isYouTubePlaying]
  );

  const startPlayback = useCallback(async () => {
    if (isYouTubeLive && isYouTubePlaying) return;
    try {
      const data = await fetchCurrentRadio();
      if (data && data.active) await applyRadioDataToAudio(data, true);
      else setIsPlaying(false);
    } catch (err) {
      console.error("Gagal memulai playback:", err);
      setHasError(true);
      setIsPlaying(false);
    }
  }, [applyRadioDataToAudio, fetchCurrentRadio, isYouTubeLive, isYouTubePlaying]);

  const togglePlay = async (play?: boolean) => {
    if (!audioRef.current) return;
    if (!isInitialized.current) initAudio();

    if (play === false || (isPlaying && play === undefined)) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.load();
      setIsPlaying(false);
      userStoppedRef.current = true;
    } else {
      userStoppedRef.current = false;
      await startPlayback();
    }
  };

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch {}
      }
    };
  }, []);

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        hasError,
        metadata,
        listeners,
        togglePlay,
        analyserRef,
        isYouTubeLive,
        setIsYouTubeLive,
        isYouTubePlaying,
        setIsYouTubePlaying,
      }}
    >
      <audio ref={audioRef} crossOrigin="anonymous" preload="none" className="hidden" />
      {children}
    </AudioContext.Provider>
  );
}

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio harus di dalam AudioProvider");
  return context;
};