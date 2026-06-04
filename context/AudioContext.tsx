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
  const isAutoSwitchingRef = useRef(false);

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

  // Fetch radio MP3
  const fetchCurrentRadio = useCallback(async () => {
    const res = await fetch("/api/get-current-radio", { cache: "no-store" });
    if (!res.ok) throw new Error("Radio API offline");
    return res.json();
  }, []);

  // Load & play MP3 radio
  const applyRadioDataToAudio = useCallback(
    async (data: any, forceReload = false) => {
      if (!audioRef.current || !data?.active || !data.audio_url) return false;

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
      const targetTime = Number(data.elapsed_seconds || 0);
      const currentTime = Number(audio.currentTime || 0);
      const timeDrift = Math.abs(currentTime - targetTime);

      const shouldReload =
        forceReload ||
        currentSrc !== nextSrc ||
        lastSyncedUrlRef.current !== nextSrc ||
        timeDrift > 8;

      setMetadata({
        title: data.title || "Siaran Sedang Aktif",
        artist: "Radio Suara Al Muttaqin",
        art: "/bg-player.png",
      });
      setListeners(1);

      if (!shouldReload) return true;

      try {
        isAutoSwitchingRef.current = true;
        audio.src = data.audio_url;
        audio.load();

        await new Promise<void>((resolve) => {
          const onLoadedMetadata = () => {
            audio.removeEventListener("loadedmetadata", onLoadedMetadata);
            resolve();
          };
          audio.addEventListener("loadedmetadata", onLoadedMetadata);
          setTimeout(resolve, 1200);
        });

        if (targetTime > 0 && (!audio.duration || targetTime < audio.duration)) {
          audio.currentTime = targetTime;
        } else {
          audio.currentTime = 0;
        }

        if (audioCtx && audioCtx.state === "suspended") await audioCtx.resume();
        await audio.play();

        lastSyncedUrlRef.current = nextSrc;
        userStoppedRef.current = false;
        setIsPlaying(true);
        setHasError(false);
        return true;
      } catch (err) {
        console.error("Gagal menerapkan audio radio:", err);
        setHasError(true);
        return false;
      } finally {
        isAutoSwitchingRef.current = false;
      }
    },
    [isYouTubeLive, isYouTubePlaying]
  );

  // Fetch metadata
  const fetchMetadata = useCallback(async () => {
    try {
      const data = await fetchCurrentRadio();
      if (data && data.active && !isYouTubeLive) {
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
    } catch {
      setMetadata({
        title: "Siaran Sedang Offline",
        artist: "Radio Suara Al Muttaqin",
        art: "/bg-player.png",
      });
      setListeners(0);
    }
  }, [fetchCurrentRadio, isYouTubeLive]);

  useEffect(() => {
    fetchMetadata();
    const interval = setInterval(fetchMetadata, 15000);
    return () => clearInterval(interval);
  }, [fetchMetadata]);

  // Audio Engine
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
      console.log("Audio Engine Virtual Radio RSM Aktif Terpusat");
    } catch (err) {
      console.error("Gagal inisialisasi Audio Engine:", err);
    }
  }, []);

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

  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (!isInitialized.current) initAudio();

    if (isPlaying) {
      userStoppedRef.current = true;
      isAutoSwitchingRef.current = false;
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.load();
      lastSyncedUrlRef.current = "";
      setIsPlaying(false);
    } else {
      userStoppedRef.current = false;
      setHasError(false);
      await startPlayback();
    }
  };

  // Sync interval
  useEffect(() => {
    if (!isPlaying || isYouTubeLive) return;
    const interval = setInterval(async () => {
      if (userStoppedRef.current) return;
      try {
        const data = await fetchCurrentRadio();
        await applyRadioDataToAudio(data, false);
      } catch (err) {
        console.error(err);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, isYouTubeLive, applyRadioDataToAudio, fetchCurrentRadio]);

  const handleAudioEnded = async () => {
    if (userStoppedRef.current || (isYouTubeLive && isYouTubePlaying)) return;
    setIsPlaying(true);
    await startPlayback();
  };

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
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        preload="none"
        onPause={() => {
          if (!isAutoSwitchingRef.current && userStoppedRef.current) setIsPlaying(false);
        }}
        onPlay={() => {
          userStoppedRef.current = false;
          setIsPlaying(true);
          setHasError(false);
        }}
        onEnded={handleAudioEnded}
        onError={() => {
          if (isAutoSwitchingRef.current) return;
          setHasError(true);
          setIsPlaying(false);
          console.warn("Virtual Radio RSM Offline / CORS Issue");
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