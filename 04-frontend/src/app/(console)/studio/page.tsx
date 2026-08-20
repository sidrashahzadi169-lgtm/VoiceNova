"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FileText,
  Sliders,
  Headphones,
  FileUp,
  Clipboard,
  Trash2,
  Timer,
  Search,
  Sparkles,
  Play,
  Pause,
  Square,
  Download,
  DownloadCloud,
  Link,
  CheckCircle,
  Loader2,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export default function Studio() {
  // Script Editor states
  const [scriptText, setScriptText] = useState(
    "Welcome to the VoiceNova Generate Studio. This dedicated environment represents the absolute peak of neural synthesis performance. Adjust the voice settings parameters, including pitch deviation, speed rate, clarity enhancement, and stability limits to shape your custom voices in real-time."
  );

  // Settings states
  const [voiceSearch, setVoiceSearch] = useState("");
  const [category, setCategory] = useState("standard");
  const [language, setLanguage] = useState("en");
  const [actor, setActor] = useState(""); // ElevenLabs voice_id
  const [actorName, setActorName] = useState("Select a voice...");
  const [accent, setAccent] = useState("us");
  const [gender, setGender] = useState("female");
  const [age, setAge] = useState("middle");
  const [emotion, setEmotion] = useState("calm");

  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [stability, setStability] = useState(75);
  const [clarity, setClarity] = useState(80);

  // ─── ElevenLabs Voice Catalog State ────────────────────────────────────────
  interface ElevenLabsVoice {
    id: string;
    name: string;
    displayName: string;
    gender: string;
    accent: string;
    age: string;
    category: string;
    previewUrl: string | null;
    description: string | null;
  }

  const [elVoices, setElVoices] = useState<ElevenLabsVoice[]>([]);
  const [voicesLoading, setVoicesLoading] = useState(true);
  const [voicesError, setVoicesError] = useState<string | null>(null);
  const [voicesErrorCode, setVoicesErrorCode] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);

  // Fallback static voices if ElevenLabs is unreachable
  const FALLBACK_VOICES: ElevenLabsVoice[] = [
    { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", displayName: "Rachel (Female, American)", gender: "Female", accent: "American", age: "Adult", category: "Standard", previewUrl: null, description: null },
    { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi", displayName: "Domi (Female, American)", gender: "Female", accent: "American", age: "Adult", category: "Standard", previewUrl: null, description: null },
    { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella", displayName: "Bella (Female, American)", gender: "Female", accent: "American", age: "Adult", category: "Standard", previewUrl: null, description: null },
    { id: "ErXwobaYiN019PkySvjV", name: "Antoni", displayName: "Antoni (Male, American)", gender: "Male", accent: "American", age: "Adult", category: "Standard", previewUrl: null, description: null },
    { id: "VR6AewLTigWG4xSOukaG", name: "Arnold", displayName: "Arnold (Male, American)", gender: "Male", accent: "American", age: "Adult", category: "Standard", previewUrl: null, description: null },
    { id: "pNInz6obpgDQGcFmaJgB", name: "Adam", displayName: "Adam (Male, American)", gender: "Male", accent: "American", age: "Adult", category: "Standard", previewUrl: null, description: null },
    { id: "yoZ06aMxZJJ28mfd3POQ", name: "Sam", displayName: "Sam (Male, American)", gender: "Male", accent: "American", age: "Adult", category: "Standard", previewUrl: null, description: null },
  ];

  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ─── Fetch ElevenLabs Voices on mount ──────────────────────────────────────
  const fetchElevenLabsVoices = useCallback(async (tokenArg?: string | null) => {
    setVoicesLoading(true);
    setVoicesError(null);
    setVoicesErrorCode(null);

    try {
      const activeToken = tokenArg !== undefined ? tokenArg : sessionToken;
      const headers: Record<string, string> = {};
      if (activeToken) {
        headers["Authorization"] = `Bearer ${activeToken}`;
      }
      const res = await fetch("http://localhost:5000/api/elevenlabs/voices", {
        headers,
        signal: AbortSignal.timeout(12_000),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        const code = data.code ?? "UNKNOWN";
        setVoicesErrorCode(code);

        if (code === "API_KEY_INSUFFICIENT_PERMISSIONS" || code === "MISSING_PERMISSIONS") {
          // Key works but scopes are missing — use fallback voices
          setVoicesError(
            "API key is missing required permissions. Using built-in voices instead.\n" +
            (data.message ?? "")
          );
          setElVoices(FALLBACK_VOICES);
          setApiConnected(false);
          if (!actor) {
            setActor(FALLBACK_VOICES[0].id);
            setActorName(FALLBACK_VOICES[0].displayName);
          }
        } else {
          setVoicesError(data.message ?? "Failed to fetch voices from ElevenLabs.");
          setElVoices(FALLBACK_VOICES);
          setApiConnected(false);
          if (!actor) {
            setActor(FALLBACK_VOICES[0].id);
            setActorName(FALLBACK_VOICES[0].displayName);
          }
        }
        return;
      }

      const voices: ElevenLabsVoice[] = data.data ?? [];
      setElVoices(voices);
      setApiConnected(true);

      // Auto-select first voice
      if (voices.length > 0 && !actor) {
        setActor(voices[0].id);
        setActorName(voices[0].displayName);
      }

      showToast(`✓ ${voices.length} ElevenLabs voices loaded`);
    } catch (err) {
      const e = err as Error;
      const isTimeout = e.name === "TimeoutError" || e.name === "AbortError";
      const msg = isTimeout
        ? "Voice server timed out. Using built-in voice list."
        : "Could not connect to voice server. Using built-in voice list.";

      setVoicesError(msg);
      setVoicesErrorCode("NETWORK_ERROR");
      setElVoices(FALLBACK_VOICES);
      setApiConnected(false);
      if (!actor) {
        setActor(FALLBACK_VOICES[0].id);
        setActorName(FALLBACK_VOICES[0].displayName);
      }
    } finally {
      setVoicesLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function initSessionAndWorkspace() {
      let token: string | null = null;
      try {
        const sessionRes = await fetch("/api/auth/session");
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData.authenticated && sessionData.token) {
            token = sessionData.token;
            setSessionToken(token);
          }
        }
      } catch (err) {
        console.error("Failed to fetch session token", err);
      }

      fetchElevenLabsVoices(token);

      const lastGenId = localStorage.getItem("voicenova_last_generation_id");
      if (lastGenId) {
        try {
          const headers: Record<string, string> = {};
          if (token) {
            headers["Authorization"] = `Bearer ${token}`;
          }
          const logRes = await fetch(`http://localhost:5000/api/elevenlabs/log/${lastGenId}`, { headers });
          if (logRes.ok) {
            const logData = await logRes.json();
            if (logData.success && logData.data) {
              const logObj = logData.data;
              setScriptText(logObj.text);
              setActor(logObj.voiceId);
              setActorName(logObj.voiceName);
              setAudioUrl(`http://localhost:5000${logObj.audioUrl}`);
              setGenerationId(logObj.downloadId);
              setIsSynthesized(true);
              setGenerationMeta({
                voiceName: logObj.voiceName,
                charCount: logObj.charCount,
                duration: logObj.duration,
                format: logObj.format,
              });
              setSimulatedDuration(logObj.duration);
              showToast("✓ Workspace session restored");
            }
          }
        } catch (err) {
          console.error("Failed to restore last generation", err);
        }
      }
    }

    initSessionAndWorkspace();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Synthesizer running states
  const [isSynthesized, setIsSynthesized] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [generationMeta, setGenerationMeta] = useState<{
    voiceName: string;
    charCount: number;
    duration: number;
    format: string;
  } | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Timeline Scrubber States
  const [scrubberProgress, setScrubberProgress] = useState(0);
  const [simulatedDuration, setSimulatedDuration] = useState(6.0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const waveOffsetRef = useRef<number>(0);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const playStartTimeRef = useRef<number>(0);

  // Global Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Preset Template scripts
  const templates: Record<string, string> = {
    youtube: "Hey guys! Welcome back to the channel. Today, we're exploring the future of real-time voice synthesis engines. Make sure to hit that subscribe button, drop a thumbs up, and let's get started.",
    facebook: "What is going on guys? 🚀 Quick update: this entire voice clip is synthesized using artificial intelligence. How clean does it sound? Drop a comment below and share this video!",
    tiktok: "POV: You cloned your voice in exactly 10 seconds, and it sounds cleaner than a studio microphone. Start cloning yours free on VoiceNova right now! #voiceclone #aivoice #nova",
    podcast: "Welcome back to the Tech Horizon Podcast. In today's episode, we discuss semantic cloning, vocal asset rights, and deep learning pipelines. Let's take a quick 1-second pause to hear the breathing detail in this synthesizer.",
  };

  // Canvas visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 300;
      canvas.height = canvas.parentElement?.clientHeight || 120;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.save();
      ctx.lineWidth = 2;

      let mode: "idle" | "generating" | "playing" = "idle";
      if (isSynthesizing) mode = "generating";
      if (isPlaying) mode = "playing";

      if (mode === "idle") {
        ctx.strokeStyle = "rgba(108, 99, 255, 0.2)";
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        for (let x = 0; x < width; x++) {
          const y = centerY + Math.sin(x * 0.05 + waveOffsetRef.current) * 1.5;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        waveOffsetRef.current += 0.02;
      } else if (mode === "generating") {
        ctx.strokeStyle = "rgba(245, 158, 11, 0.5)";
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        for (let x = 0; x < width; x++) {
          const amp = Math.sin(x * 0.005) * 12;
          const y = centerY + Math.sin(x * 0.08 + waveOffsetRef.current) * amp;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        waveOffsetRef.current += 0.2;
      } else if (mode === "playing") {
        waveOffsetRef.current += 0.15;
        const waves = [
          { amp: 22, freq: 0.02, color: "rgba(108, 99, 255, 0.7)" },
          { amp: 14, freq: 0.035, color: "rgba(0, 194, 255, 0.6)" },
          { amp: 8, freq: 0.05, color: "rgba(255, 255, 255, 0.3)" },
        ];

        const volumeModulation = Math.sin(waveOffsetRef.current * 0.05) * 0.5 + 0.5;
        const breathModulation = Math.max(0.1, Math.sin(waveOffsetRef.current * 0.15));

        waves.forEach((wave) => {
          ctx.strokeStyle = wave.color;
          ctx.beginPath();
          ctx.moveTo(0, centerY);
          for (let x = 0; x < width; x++) {
            const envelope = Math.sin((x / width) * Math.PI);
            const speechPattern = Math.sin(x * 0.01) * 0.4 + 0.6;
            const finalAmp = wave.amp * envelope * volumeModulation * breathModulation * speechPattern;
            const y = centerY + Math.sin(x * wave.freq + waveOffsetRef.current) * finalAmp;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        });
      }

      ctx.restore();
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isSynthesizing, isPlaying]);

  // Audio Playback timeline updates helper
  const stopPlayback = () => {
    setIsPlaying(false);
    setScrubberProgress(0);
    setElapsedTime(0);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
    if (synth) {
      synth.cancel();
    }
  };

  const handlePlayPause = () => {
    if (!isSynthesized) return;

    if (isPlaying) {
      stopPlayback();
      return;
    }

    setIsPlaying(true);

    if (audioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      audioRef.current.src = audioUrl;
      audioRef.current.currentTime = scrubberProgress * simulatedDuration;
      
      audioRef.current.play().catch((err) => {
        console.error("Audio playback failed", err);
        showToast("Audio play failed.", "error");
        stopPlayback();
      });

      progressIntervalRef.current = setInterval(() => {
        if (audioRef.current) {
          const current = audioRef.current.currentTime;
          const duration = audioRef.current.duration || simulatedDuration;
          setElapsedTime(current);
          setScrubberProgress(duration ? current / duration : 0);
          if (audioRef.current.ended) {
            stopPlayback();
          }
        }
      }, 30);
    } else {
      playStartTimeRef.current = Date.now() - scrubberProgress * simulatedDuration * 1000;

      const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
      if (synth) {
        synth.cancel();

        speechUtteranceRef.current = new SpeechSynthesisUtterance(scriptText);
        speechUtteranceRef.current.rate = speed;

        const voices = synth.getVoices();
        let matchedVoice = null;

        if (actor === "Nova") {
          matchedVoice = voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Female") || v.name.includes("Zira")));
        } else if (actor === "Aero") {
          matchedVoice = voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Male") || v.name.includes("David")));
        }

        if (!matchedVoice) {
          matchedVoice = voices.find((v) => v.lang.startsWith("en")) || voices[0];
        }

        if (matchedVoice) {
          speechUtteranceRef.current.voice = matchedVoice;
        }

        speechUtteranceRef.current.onend = stopPlayback;
        speechUtteranceRef.current.onerror = stopPlayback;

        synth.speak(speechUtteranceRef.current);
      }

      progressIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - playStartTimeRef.current) / 1000;
        const progress = Math.min(1.0, elapsed / simulatedDuration);

        setScrubberProgress(progress);
        setElapsedTime(Math.min(simulatedDuration, elapsed));

        if (progress >= 1.0) {
          stopPlayback();
        }
      }, 30);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Synthesis engine — calls ElevenLabs directly, no DB lookup needed
  const handleSynthesize = async () => {
    const text = scriptText.trim();
    if (!text) {
      showToast("Speech script editor is empty!", "error");
      return;
    }
    if (!actor) {
      showToast("Please select a voice first.", "error");
      return;
    }

    setIsSynthesizing(true);
    setIsSynthesized(false);
    setGenerationId(null);
    setGenerationMeta(null);
    stopPlayback();

    try {
      const selectedVoice = elVoices.find((v) => v.id === actor);

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (sessionToken) {
        headers["Authorization"] = `Bearer ${sessionToken}`;
      }
      const res = await fetch("http://localhost:5000/api/elevenlabs/synthesize", {
        method: "POST",
        headers,
        body: JSON.stringify({
          voiceId: actor,
          voiceName: selectedVoice?.name ?? actorName,
          text,
          stability,
          similarity_boost: clarity,
          speed,
        }),
        signal: AbortSignal.timeout(45_000),
      });

      const data = await res.json();
      setIsSynthesizing(false);

      if (!res.ok || !data.success) {
        // Graceful fallback — browser TTS for preview
        setIsSynthesized(true);
        const duration = Math.max(2.5, (text.length * 0.065) / speed);
        setSimulatedDuration(duration);
        showToast(data.message ?? "Synthesis failed — using browser preview.", "error");
        return;
      }

      // ✅ Real ElevenLabs audio
      setIsSynthesized(true);
      setGenerationId(data.data.downloadId);
      localStorage.setItem("voicenova_last_generation_id", data.data.downloadId);
      setAudioUrl(`http://localhost:5000${data.data.audioUrl}`);
      setGenerationMeta({
        voiceName: data.data.voiceName,
        charCount: data.data.charCount,
        duration: data.data.duration,
        format: "MP3",
      });
      const duration = data.data.duration ?? Math.max(2.5, (text.length * 0.065) / speed);
      setSimulatedDuration(duration);
      const sizeKb = Math.round(data.data.sizeBytes / 1024);
      showToast(`✓ Synthesized — ${data.data.charCount} chars · ${duration.toFixed(1)}s · ${sizeKb} KB`);

    } catch (err) {
      const e = err as Error;
      setIsSynthesizing(false);
      setIsSynthesized(true);
      const duration = Math.max(2.5, (text.length * 0.065) / speed);
      setSimulatedDuration(duration);
      if (e.name === "TimeoutError" || e.name === "AbortError") {
        showToast("Synthesis timed out — using browser preview.", "error");
      } else {
        showToast("Server offline — using browser preview.", "error");
      }
    }
  };
  // ─── Download Handler ─────────────────────────────────────────────────────
  const handleDownload = (format: "MP3" | "WAV" = "MP3") => {
    if (!generationId) {
      showToast("No audio to download. Synthesize first.", "error");
      return;
    }
    showToast("✓ Download started!");
    window.location.href = `http://localhost:5000/api/elevenlabs/audio/${generationId}?download=1`;
  };

  // ─── Copy Share Link ──────────────────────────────────────────────────────
  const handleCopyLink = async () => {
    if (!generationId) {
      showToast("No audio generated yet.", "error");
      return;
    }
    const link = `http://localhost:5000/api/elevenlabs/audio/${generationId}`;
    try {
      await navigator.clipboard.writeText(link);
      showToast("✓ Direct download link copied to clipboard!");
    } catch {
      showToast("Could not access clipboard.", "error");
    }
  };

  // Document Helpers
  const insertPause = () => {
    setScriptText((prev) => prev + " [pause: 1.0s] ");
    showToast("Pause marker inserted.");
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setScriptText((prev) => prev + " " + text);
      showToast("Pasted text from clipboard.");
    } catch (e) {
      showToast("Could not access clipboard", "error");
    }
  };

  const handleTemplate = (key: string) => {
    if (templates[key]) {
      setScriptText("");
      let idx = 0;
      const timer = setInterval(() => {
        if (idx < templates[key].length) {
          setScriptText((prev) => prev + templates[key].charAt(idx));
          idx++;
        } else {
          clearInterval(timer);
          showToast("Template loaded.");
        }
      }, 10);
    }
  };

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSynthesized) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const progress = Math.min(1.0, Math.max(0, clickX / width));

    setScrubberProgress(progress);
    setElapsedTime(progress * simulatedDuration);

    if (audioUrl && audioRef.current) {
      audioRef.current.currentTime = progress * simulatedDuration;
    } else if (isPlaying) {
      playStartTimeRef.current = Date.now() - progress * simulatedDuration * 1000;
    }
  };

  return (
    <div className="dash-workspace">
      
      {/* 3-Column Studio Grid Layout */}
      <div className="studio-three-panel-grid">
        
        {/* PANEL 1: SCRIPT EDITOR */}
        <div className="studio-column-panel glass-panel script-panel-card">
          <div className="panel-header-row">
            <div className="panel-header-title">
              <FileText className="panel-title-icon" size={16} />
              <span>Script Editor</span>
            </div>
            <div className="auto-save-indicator">
              <span className="save-dot" />
              <span id="saveStatusLabel">Auto-saved</span>
            </div>
          </div>

          <div className="editor-action-bar">
            <div className="left-actions" style={{ display: "flex", gap: "8px" }}>
              <button className="editor-action-btn" id="importFileBtn" onClick={() => showToast("Simulating TXT import...")}>
                <FileUp size={14} style={{ marginRight: "4px" }} /> <span>Import</span>
              </button>
              <button className="editor-action-btn" id="pasteClipboardBtn" onClick={handlePaste}>
                <Clipboard size={14} style={{ marginRight: "4px" }} /> <span>Paste</span>
              </button>
            </div>
            <button className="editor-action-btn color-red-btn" id="clearEditorBtn" onClick={() => { setScriptText(""); showToast("Cleared editor."); }}>
              <Trash2 size={14} style={{ marginRight: "4px" }} /> <span>Clear</span>
            </button>
          </div>

          <textarea
            className="studio-large-textarea"
            id="studioTextArea"
            maxLength={10000}
            placeholder="Start typing your script here..."
            value={scriptText}
            onChange={(e) => setScriptText(e.target.value)}
          />

          <div className="editor-footer-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
            <button className="btn btn-outline btn-sm" id="insertPauseBtn" onClick={insertPause}>
              <Timer size={14} style={{ marginRight: "4px" }} /> Insert Pause (1s)
            </button>
            <div className="char-count-display" style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
              <span id="studioCharCount">{scriptText.length}</span> / 10,000 chars
            </div>
          </div>

          {/* Quick template loads */}
          <div style={{ marginTop: "20px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "12px" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block", marginBottom: "8px" }}>Load Quick Script Preset:</span>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <button className="btn btn-outline btn-sm" onClick={() => handleTemplate("youtube")}>YouTube</button>
              <button className="btn btn-outline btn-sm" onClick={() => handleTemplate("tiktok")}>TikTok</button>
              <button className="btn btn-outline btn-sm" onClick={() => handleTemplate("podcast")}>Podcast</button>
            </div>
          </div>
        </div>

        {/* PANEL 2: SETTINGS CONFIGURATION */}
        <div className="studio-column-panel glass-panel settings-panel-card">
          <div className="panel-header-row">
            <div className="panel-header-title">
              <Sliders className="panel-title-icon" size={16} />
              <span>Voice Configuration</span>
            </div>
          </div>

          <div className="settings-scroll-view" style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "4px 0" }}>
            <div className="settings-form-group">
              <label>Search Voice Profile</label>
              <div className="search-bar-wrapper" style={{ maxWidth: "100%" }}>
                <Search className="search-icon" size={14} />
                <input
                  type="text"
                  placeholder="Search voices by name..."
                  value={voiceSearch}
                  onChange={(e) => setVoiceSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="settings-form-group">
              <label htmlFor="voiceCategory">Voice Category</label>
              <div className="custom-select">
                <select id="voiceCategory" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="standard">Standard Synthesizers</option>
                  <option value="clones">Custom Clones</option>
                  <option value="premium">Premium Narrators</option>
                </select>
              </div>
            </div>

            <div className="settings-grid-selectors" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="settings-form-group">
                <label htmlFor="studioLanguage">Language</label>
                <div className="custom-select">
                  <select id="studioLanguage" value={language} onChange={(e) => setLanguage(e.target.value)}>
                    <option value="en">English (US)</option>
                    <option value="ur">Urdu (اردو)</option>
                    <option value="es">Spanish (Español)</option>
                    <option value="fr">French (Français)</option>
                  </select>
                </div>
              </div>

              <div className="settings-form-group">
                <label htmlFor="studioVoice" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  Voice Actor
                  {voicesLoading && (
                    <Loader2 size={11} style={{ animation: "spin 1s linear infinite", color: "var(--color-primary)" }} />
                  )}
                  {!voicesLoading && apiConnected === true && (
                    <span title="Connected to ElevenLabs" style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "0.65rem", color: "#22c55e" }}>
                      <Wifi size={10} /> Live
                    </span>
                  )}
                  {!voicesLoading && apiConnected === false && (
                    <button
                      onClick={() => fetchElevenLabsVoices()}
                      title="Retry ElevenLabs connection"
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: "3px", color: "var(--color-warning, #f59e0b)", fontSize: "0.65rem" }}
                    >
                      <WifiOff size={10} /> Retry
                    </button>
                  )}
                </label>

                {/* Error/status banner */}
                {voicesError && !voicesLoading && (
                  <div style={{
                    background: "rgba(245,158,11,0.08)",
                    border: "1px solid rgba(245,158,11,0.25)",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    marginBottom: "6px",
                    fontSize: "0.7rem",
                    color: "#f59e0b",
                    display: "flex",
                    gap: "6px",
                    alignItems: "flex-start",
                  }}>
                    <AlertCircle size={11} style={{ flexShrink: 0, marginTop: "1px" }} />
                    <span>{voicesErrorCode === "API_KEY_INSUFFICIENT_PERMISSIONS" || voicesErrorCode === "MISSING_PERMISSIONS"
                      ? "API key needs voices_read permission. Using built-in voices."
                      : voicesError.split("\n")[0]
                    }</span>
                  </div>
                )}

                <div className="custom-select" style={{ position: "relative" }}>
                  {voicesLoading && (
                    <div style={{
                      position: "absolute", inset: 0, display: "flex", alignItems: "center",
                      paddingLeft: "12px", gap: "8px", zIndex: 1, pointerEvents: "none",
                      background: "var(--color-surface, rgba(255,255,255,0.04))",
                      borderRadius: "6px", fontSize: "0.8rem", color: "var(--color-text-muted)",
                    }}>
                      <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
                      <span>Loading ElevenLabs voices...</span>
                    </div>
                  )}
                  <select
                    id="studioVoice"
                    value={actor}
                    disabled={voicesLoading}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const found = elVoices.find(v => v.id === selectedId);
                      setActor(selectedId);
                      setActorName(found?.displayName ?? selectedId);
                    }}
                    style={{ opacity: voicesLoading ? 0 : 1 }}
                  >
                    {elVoices.length === 0 && !voicesLoading && (
                      <option value="" disabled>No voices available</option>
                    )}
                    {/* Group by gender for better UX */}
                    {["Female", "Male", "Other", "Unknown"].map(g => {
                      const group = elVoices.filter(v =>
                        (voiceSearch
                          ? v.displayName.toLowerCase().includes(voiceSearch.toLowerCase()) ||
                            v.name.toLowerCase().includes(voiceSearch.toLowerCase())
                          : true) &&
                        v.gender.toLowerCase() === g.toLowerCase()
                      );
                      if (!group.length) return null;
                      return (
                        <optgroup key={g} label={`${g} Voices`}>
                          {group.map(v => (
                            <option key={v.id} value={v.id}>{v.displayName}</option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                </div>

                {/* Preview URL if available */}
                {actor && !voicesLoading && (() => {
                  const selectedVoice = elVoices.find(v => v.id === actor);
                  return selectedVoice?.previewUrl ? (
                    <div style={{ marginTop: "4px" }}>
                      <audio
                        controls
                        src={selectedVoice.previewUrl}
                        style={{ width: "100%", height: "28px", borderRadius: "6px", opacity: 0.8 }}
                      />
                    </div>
                  ) : null;
                })()}
              </div>

              <div className="settings-form-group">
                <label htmlFor="studioAccent">Accent Profile</label>
                <div className="custom-select">
                  <select id="studioAccent" value={accent} onChange={(e) => setAccent(e.target.value)}>
                    <option value="us">United States (US)</option>
                    <option value="uk">United Kingdom (UK)</option>
                    <option value="au">Australia (AU)</option>
                  </select>
                </div>
              </div>

              <div className="settings-form-group">
                <label htmlFor="studioGender">Gender Tone</label>
                <div className="custom-select">
                  <select id="studioGender" value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="female">Female Profile</option>
                    <option value="male">Male Profile</option>
                    <option value="neutral">Neutral Profile</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sliders panel */}
            <div className="settings-sliders-column" style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "10px" }}>
              <div className="settings-slider-item">
                <div className="slider-label-row" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                  <label htmlFor="sliderSpeed">Speed Rate</label>
                  <span className="slider-display-val">{speed.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="premium-slider"
                />
              </div>

              <div className="settings-slider-item">
                <div className="slider-label-row" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                  <label htmlFor="sliderPitch">Pitch Deviation</label>
                  <span className="slider-display-val">{pitch >= 0 ? `+${pitch}` : pitch}%</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="5"
                  value={pitch}
                  onChange={(e) => setPitch(parseInt(e.target.value))}
                  className="premium-slider"
                />
              </div>

              <div className="settings-slider-item">
                <div className="slider-label-row" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                  <label>Voice Stability</label>
                  <span className="slider-display-val">{stability}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={stability}
                  onChange={(e) => setStability(parseInt(e.target.value))}
                  className="premium-slider"
                />
                <div className="slider-indicators" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--color-text-muted)", marginTop: "2px" }}>
                  <span>More Varied</span>
                  <span>More Stable</span>
                </div>
              </div>

              <div className="settings-slider-item">
                <div className="slider-label-row" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                  <label>Clarity Enhancement</label>
                  <span className="slider-display-val">{clarity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={clarity}
                  onChange={(e) => setClarity(parseInt(e.target.value))}
                  className="premium-slider"
                />
                <div className="slider-indicators" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--color-text-muted)", marginTop: "2px" }}>
                  <span>Standard Node</span>
                  <span>High Detail</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL 3: AUDIO PREVIEW PLAYER */}
        <div className="studio-column-panel glass-panel preview-panel-card">
          <div className="panel-header-row">
            <div className="panel-header-title">
              <Headphones className="panel-title-icon" size={16} />
              <span>Audio Preview</span>
            </div>
          </div>

          <div className="preview-panel-content" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Player Canvas */}
            <div className="studio-waveform-box glass-panel" style={{ height: "120px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
              <canvas ref={canvasRef} id="studioPlayerCanvas" style={{ width: "100%", height: "100%" }} />
              <div className="waveform-overlay-status" id="waveformStatus" style={{ display: isSynthesizing ? "flex" : "none" }}>
                <span>Processing Synthesis Models...</span>
              </div>
              {!isSynthesizing && !isSynthesized && (
                <div className="waveform-overlay-status" style={{ display: "flex" }}>
                  <span>Ready for Synthesis</span>
                </div>
              )}
              {isSynthesized && !isPlaying && !isSynthesizing && (
                <div className="waveform-overlay-status" style={{ display: "flex", color: "var(--color-success)" }}>
                  <span>Audio Stream Ready</span>
                </div>
              )}
            </div>

            {/* Scrubber tracker */}
            <div className="player-progress-bar-wrapper" style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="player-current-time" style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{formatTime(elapsedTime)}</span>
              <div className="player-scrubber-track" id="playerScrubber" onClick={handleScrubberClick} style={{ flex: 1, height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", position: "relative", cursor: "pointer" }}>
                <div className="player-scrubber-fill" style={{ height: "100%", width: `${scrubberProgress * 100}%`, background: "linear-gradient(90deg, var(--color-primary), var(--color-secondary))", borderRadius: "3px" }} />
              </div>
              <span className="player-current-time" style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{formatTime(simulatedDuration)}</span>
            </div>

            {/* Main triggers */}
            <div className="player-controls-row" style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center" }}>
              <button className="player-control-icon-btn btn-stop" onClick={stopPlayback} disabled={!isSynthesized}>
                <Square size={14} />
              </button>
              <button className="studio-generate-btn-glowing" id="generateVoiceBtn" onClick={handleSynthesize} disabled={isSynthesizing}>
                <Sparkles size={14} style={{ marginRight: "6px" }} /> <span>{isSynthesizing ? "Processing..." : "Synthesize Voice"}</span>
              </button>
              <button className="player-control-icon-btn btn-play" onClick={handlePlayPause} disabled={!isSynthesized}>
                {isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
              </button>
            </div>

            {/* Exporting formats list */}
            <div className="exporters-list" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "16px" }}>
              <h4 className="exporter-title" style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "12px" }}>Export Audio</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

                {/* ── Download MP3 ── */}
                <button
                  id="downloadMp3Btn"
                  className="btn btn-secondary btn-full btn-exporter"
                  onClick={() => handleDownload("MP3")}
                  disabled={!isSynthesized || !generationId || isDownloading}
                  style={{ position: "relative", overflow: "hidden" }}
                >
                  {isDownloading ? (
                    <Loader2 size={14} style={{ marginRight: "6px", animation: "spin 1s linear infinite" }} />
                  ) : (
                    <Download size={14} style={{ marginRight: "6px" }} />
                  )}
                  <span>{isDownloading ? "Downloading..." : "Download MP3"}</span>
                  {/* File size hint */}
                  {generationMeta && !isDownloading && (
                    <span style={{
                      marginLeft: "auto",
                      fontSize: "0.7rem",
                      opacity: 0.6,
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      ~{Math.round((generationMeta.charCount * 160) / 8 / 1024)} KB
                    </span>
                  )}
                </button>

                {/* ── WAV note ── ElevenLabs only streams MP3; show disabled with tooltip */}
                <button
                  id="downloadWavBtn"
                  className="btn btn-secondary btn-full btn-exporter"
                  disabled
                  title="WAV export requires ElevenLabs PCM output — not available on this plan"
                  style={{ opacity: 0.45, cursor: "not-allowed" }}
                >
                  <DownloadCloud size={14} style={{ marginRight: "6px" }} />
                  <span>Download WAV</span>
                  <span style={{ marginLeft: "auto", fontSize: "0.68rem", opacity: 0.7 }}>MP3 only</span>
                </button>

                {/* ── Copy direct download link ── */}
                <button
                  id="copyShareLinkBtn"
                  className="btn btn-outline btn-full btn-exporter"
                  onClick={handleCopyLink}
                  disabled={!generationId}
                >
                  <Link size={14} style={{ marginRight: "6px" }} />
                  <span>Copy Download Link</span>
                </button>

              </div>

              {/* Generation metadata strip */}
              {generationMeta && (
                <div style={{
                  marginTop: "12px",
                  padding: "8px 10px",
                  background: "rgba(108,99,255,0.06)",
                  border: "1px solid rgba(108,99,255,0.15)",
                  borderRadius: "6px",
                  fontSize: "0.72rem",
                  color: "var(--color-text-muted)",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                }}>
                  <span>🎙 {generationMeta.voiceName}</span>
                  <span>⏱ {generationMeta.duration?.toFixed(1)}s</span>
                  <span>📝 {generationMeta.charCount} chars</span>
                  <span>🎵 {generationMeta.format}</span>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Toast notification overlay */}
      {toast && (
        <div
          className={`glass-panel toast toast-${toast.type}`}
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            padding: "12px 24px",
            borderRadius: "8px",
            zIndex: 5000,
            borderLeft: `4px solid ${toast.type === "success" ? "var(--color-success)" : "var(--color-error)"}`,
            boxShadow: "var(--shadow-soft)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            animation: "slideIn 0.3s ease forwards",
          }}
        >
          <span style={{ fontWeight: 600 }}>{toast.type === "success" ? "✓" : "✗"}</span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
