"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  PlusCircle,
  PenTool,
  Type,
  Mic,
  Folder,
  Zap,
  Music2,
  Podcast,
  Megaphone,
  BookOpen,
  Sparkles,
  Trash2,
  Timer,
  Wand2,
  Download,
  DownloadCloud,
  Link2,
  Volume2,
  CheckCircle,
  Play,
  Square,
  MoreVertical,
} from "lucide-react";

interface RecentTrack {
  id: string;
  title: string;
  voice: string;
  lang: string;
  date: string;
  duration: string;
  text: string;
}

export default function Dashboard() {
  const [userName, setUserName] = useState("Sidra");

  // Read local storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("userFullName");
      if (storedName) setUserName(storedName);
    }
  }, []);

  // Script editor states
  const [editorText, setEditorText] = useState(
    "Welcome to VoiceNova Studio. Experience the absolute pinnacle of high-fidelity neural vocal synthesis. Adjust the pitch, language, and emotional models to synthesize human-like voiceovers in real-time."
  );
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiContentType, setAiContentType] = useState("General Voice-over");
  const [aiTone, setAiTone] = useState("Professional");
  const [aiLength, setAiLength] = useState("Medium");
  const [aiLanguage, setAiLanguage] = useState("English");
  const [chosenVoice, setChosenVoice] = useState("Nova");
  const [chosenLanguage, setChosenLanguage] = useState("en");
  const [speedVal, setSpeedVal] = useState(1.0);
  const [pitchVal, setPitchVal] = useState(0);

  // Synthesizer running states
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Canvas visualizer refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const waveOffsetRef = useRef<number>(0);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Global Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Preset Script Templates
  const templateScripts: Record<string, string> = {
    youtube: "Hey guys! Welcome back to the channel. Today, we're exploring the future of real-time voice synthesis engines. Make sure to hit that subscribe button, drop a thumbs up, and let's get started.",
    facebook: "What is going on guys? 🚀 Quick update: this entire voice clip is synthesized using artificial intelligence. How clean does it sound? Drop a comment below and share this video!",
    tiktok: "POV: You cloned your voice in exactly 10 seconds, and it sounds cleaner than a studio microphone. Start cloning yours free on VoiceNova right now! #voiceclone #aivoice #nova",
    podcast: "Welcome back to the Tech Horizon Podcast. In today's episode, we discuss semantic cloning, vocal asset rights, and deep learning pipelines. Let's take a quick 1-second pause to hear the breathing detail in this synthesizer.",
    ad: "Looking for studio-grade voice narration without the voice actor costs? Welcome to VoiceNova. Synthesize emotional, high-fidelity scripts in seconds. Access over 200 distinct actors globally.",
    audiobook: "Chapter One. The shadow fell across the slate pathway. Lord Alastair paused, listening to the strange frequencies shifting in the cold air. He spoke in a low, narrative tone, wondering if the voices were real...",
  };

  // AI Script generation prompts
  const aiPromptsPresets = [
    "A 30-second Facebook Reel promoting voice cloning technology in a highly energetic narration format.",
    "A formal 1-minute audiobook chapter opening exploring high-fidelity audio pipelines.",
    "A promotional YouTube video script discussing VoiceNova v2.0-Ultra neural speech models.",
    "A calm podcast intro focusing on AI ethics and digital voice cloning rights.",
  ];

  // Recent synthesized tracks list
  const [recentTracks, setRecentTracks] = useState<RecentTrack[]>([]);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const loadRecentTracks = async (token: string) => {
    try {
      const res = await fetch("https://voice-nova-sooty.vercel.app/api/elevenlabs/history?limit=5", {
        headers: { "Authorization": "Bearer " + token },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          const mapped = data.data.map((log: any) => ({
            id: log.downloadId,
            title: "Studio Synthesis - " + log.voiceName,
            voice: log.voiceName,
            lang: log.modelId,
            date: new Date(log.createdAt).toLocaleDateString(),
            duration: `${Math.floor(log.duration / 60)}:${String(Math.floor(log.duration % 60)).padStart(2, "0")}`,
            text: log.text,
            audioUrl: "https://voice-nova-sooty.vercel.app" + log.audioUrl,
          }));
          setRecentTracks(mapped);
        }
      }
    } catch (err) {}
  };

  const loadAnalytics = async (token: string) => {
    try {
      const res = await fetch("https://voice-nova-sooty.vercel.app/api/analytics/usage", {
        headers: { "Authorization": "Bearer " + token },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAnalytics(data.data);
        }
      }
    } catch (err) {}
  };

  useEffect(() => {
    async function initDashboard() {
      try {
        const sessionRes = await fetch("/api/auth/session");
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData.authenticated && sessionData.token) {
            setSessionToken(sessionData.token);
            loadRecentTracks(sessionData.token);
            loadAnalytics(sessionData.token);
          }
        }
      } catch (err) {}
    }
    initDashboard();
  }, []);

  // Audio Playback effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 300;
      canvas.height = canvas.parentElement?.clientHeight || 80;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

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
          { amp: 18, freq: 0.02, color: "rgba(108, 99, 255, 0.7)" },
          { amp: 10, freq: 0.035, color: "rgba(0, 194, 255, 0.6)" },
          { amp: 6, freq: 0.05, color: "rgba(255, 255, 255, 0.3)" },
        ];

        const volumeModulation = Math.sin(waveOffsetRef.current * 0.05) * 0.5 + 0.5;
        const breathModulation = Math.max(0.1, Math.sin(waveOffsetRef.current * 0.15));

        waves.forEach((wave) => {
          ctx.strokeStyle = wave.color;
          ctx.beginPath();
          ctx.moveTo(0, centerY);
          for (let x = 0; x < width; x++) {
            const envelope = Math.sin((x / width) * Math.PI);
            const speechPattern = Math.sin(x * 0.015) * 0.4 + 0.6;
            const finalAmp = wave.amp * envelope * volumeModulation * breathModulation * speechPattern;
            const y = centerY + Math.sin(x * wave.freq + waveOffsetRef.current) * finalAmp;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        });
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isSynthesizing, isPlaying]);

  // AI Typing script simulation
  const simulateAITyping = (text: string) => {
    setEditorText("");
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < text.length) {
        setEditorText((prev) => prev + text.charAt(idx));
        idx++;
      } else {
        clearInterval(interval);
        showToast("Script generated successfully!");
      }
    }, 12);
  };

  const handleTemplateClick = (key: string) => {
    if (templateScripts[key]) {
      simulateAITyping(templateScripts[key]);
    }
  };

  const handleAIWriter = async () => {
    const desc = aiPrompt.trim();
    if (!desc) {
      showToast("Please describe the script first!", "error");
      return;
    }
    
    setIsSynthesizing(true);
    showToast("Generating script with AI...");
    
    try {
      const fullPrompt = "Content Type: " + aiContentType + "\nTone: " + aiTone + "\nLength: " + aiLength + "\nLanguage: " + aiLanguage + "\n\nTopic/Description: " + desc;
      
      const res = await fetch("/api/ai/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt })
      });
      const data = await res.json();
      
      if (data.success) {
        // Clear editor and simulate typing the new script
        setEditorText("");
        simulateAITyping(data.text);
      } else {
        showToast(data.message || "AI failed to generate script", "error");
      }
    } catch (err) {
      showToast("Network error contacting AI provider", "error");
    } finally {
      setIsSynthesizing(false);
    }
  };

  const insertPause = () => {
    setEditorText((prev) => prev + " [pause: 1.0s] ");
    showToast("Pause marker inserted.");
  };

  const handleSynthesisFinished = () => {
    setIsSynthesizing(false);
    setIsPlaying(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleGenerateSpeech = async () => {
    const text = editorText.trim();
    if (!text) {
      showToast("Speech script editor is empty!", "error");
      return;
    }

    if (isPlaying) {
      handleSynthesisFinished();
      return;
    }

    setIsSynthesizing(true);
    setAudioUrl(null);

    try {
      const voiceId = chosenVoice === "Nova" ? "21m00Tcm4TlvDq8ikWAM" : "pNInz6obpgDQGcFmaJgB";
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (sessionToken) {
        headers["Authorization"] = `Bearer ${sessionToken}`;
      }

      const res = await fetch("https://voice-nova-sooty.vercel.app/api/elevenlabs/synthesize", {
        method: "POST",
        headers,
        body: JSON.stringify({
          voiceId,
          voiceName: chosenVoice,
          text,
          speed: speedVal,
        }),
      });

      const data = await res.json();
      setIsSynthesizing(false);

      if (res.ok && data.success) {
        setIsPlaying(true);
        const fullUrl = `https://voice-nova-sooty.vercel.app${data.data.audioUrl}`;
        setAudioUrl(fullUrl);

        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        audioRef.current.src = fullUrl;
        audioRef.current.play().catch(() => {
          handleSynthesisFinished();
        });
        audioRef.current.onended = handleSynthesisFinished;

        if (sessionToken) {
          loadRecentTracks(sessionToken);
        }
        showToast("Speech generated successfully!");
      } else {
        showToast(data.message || "Synthesis failed.", "error");
      }
    } catch (err) {
      setIsSynthesizing(false);
      showToast("Synthesis request failed.", "error");
    }
  };

  const handlePlayRecent = (track: any) => {
    if (isPlaying) {
      handleSynthesisFinished();
      return;
    }
    if (track.audioUrl) {
      setIsPlaying(true);
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      audioRef.current.src = track.audioUrl;
      audioRef.current.play().catch(() => {
        handleSynthesisFinished();
      });
      audioRef.current.onended = handleSynthesisFinished;
      showToast(`Playing: ${track.title}`);
    } else {
      setEditorText(track.text);
      setChosenVoice(track.voice);
      handleGenerateSpeech();
    }
  };

  return (
    <div className="dash-workspace">
      
      {/* Welcome Banner Card */}
      <div className="welcome-card glass-panel">
        <div className="welcome-glow" />
        <div className="welcome-card-content-wrapper">
          <div className="welcome-card-content">
            <h1 className="welcome-title">Welcome back, {userName} 👋</h1>
            <p className="welcome-desc">
              Your neural synthesis nodes are fully active. Start generating crystal-clear voices or drafting scripts with
              our AI Assistant.
            </p>
            <div className="welcome-buttons">
              <a href="#voice-studio-anchor" className="btn btn-primary btn-glow-hover">
                <PlusCircle size={14} style={{ marginRight: "6px" }} /> Generate Speech
              </a>
              <a href="#ai-script-assistant" className="btn btn-secondary">
                <PenTool size={14} style={{ marginRight: "6px" }} /> Write Script
              </a>
            </div>
          </div>

          {/* Credit Usage Progress Ring */}
          <div className="progress-ring-wrapper">
            <svg className="progress-ring-svg" width="100" height="100">
              <circle
                className="ring-circle-bg"
                cx="50"
                cy="50"
                r="40"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                className="ring-circle-fill animate-progress-ring"
                cx="50"
                cy="50"
                r="40"
                stroke="url(#ring-gradient)"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="251.2"
                strokeDashoffset="138.16"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6C63FF" />
                  <stop offset="100%" stopColor="#00C2FF" />
                </linearGradient>
              </defs>
            </svg>
            <div className="progress-ring-text">
              <span className="ring-percentage">{analytics?.subscription ? Math.round((analytics.subscription.creditUsed / analytics.subscription.creditLimit) * 100) : 0}%</span><span className="ring-label">Used</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid" style={{ marginTop: "24px" }}>
        <div className="metric-card glass-panel">
          <div className="metric-icon-side color-purple">
            <Type size={20} />
          </div>
          <div className="metric-text-side">
            <span className="metric-label">Characters Synthesized</span>
              <h3 className="metric-number">{analytics?.metrics?.totalCharsUsedInPeriod?.toLocaleString() || "0"}</h3>
            <span className="metric-subtext">Used this billing cycle</span>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon-side color-cyan">
            <Mic size={20} />
          </div>
          <div className="metric-text-side">
            <span className="metric-label">Voices Configured</span>
              <h3 className="metric-number">{analytics?.charts?.voiceTrends?.length || 0} Active</h3>
              <span className="metric-subtext">Recently used</span>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon-side color-green">
            <Folder size={20} />
          </div>
          <div className="metric-text-side">
            <span className="metric-label">Audio Generations</span>
              <h3 className="metric-number">{analytics?.metrics?.totalGenerations?.toLocaleString() || "0"} Saved</h3>
              <span className="metric-subtext">WAV exports generated</span>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon-side color-yellow">
            <Zap size={20} />
          </div>
          <div className="metric-text-side">
            <span className="metric-label">Remaining Quota</span>
              <h3 className="metric-number">{analytics?.subscription?.remaining?.toLocaleString() || "100,000"} Chars</h3>
            <span className="metric-subtext">Quota resets in 12 days</span>
          </div>
        </div>
      </div>

      {/* Quick Templates Section */}
      <div className="quick-templates-section" style={{ marginTop: "32px" }}>
        <h3 className="dash-section-title">Quick Content Templates</h3>
        <div className="templates-grid">
          <button className="template-card glass-panel" onClick={() => handleTemplateClick("youtube")}>
            <div className="template-icon color-red">
              <Play size={16} />
            </div>
            <span className="template-name">YouTube Video</span>
          </button>
          <button className="template-card glass-panel" onClick={() => handleTemplateClick("facebook")}>
            <div className="template-icon color-blue">
              <Link2 size={16} />
            </div>
            <span className="template-name">Facebook Reel</span>
          </button>
          <button className="template-card glass-panel" onClick={() => handleTemplateClick("tiktok")}>
            <div className="template-icon color-tiktok">
              <Music2 size={16} />
            </div>
            <span className="template-name">TikTok Video</span>
          </button>
          <button className="template-card glass-panel" onClick={() => handleTemplateClick("podcast")}>
            <div className="template-icon color-purple">
              <Podcast size={16} />
            </div>
            <span className="template-name">Podcast Script</span>
          </button>
          <button className="template-card glass-panel" onClick={() => handleTemplateClick("ad")}>
            <div className="template-icon color-yellow">
              <Megaphone size={16} />
            </div>
            <span className="template-name">Advertisement</span>
          </button>
          <button className="template-card glass-panel" onClick={() => handleTemplateClick("audiobook")}>
            <div className="template-icon color-green">
              <BookOpen size={16} />
            </div>
            <span className="template-name">Audiobook Chapter</span>
          </button>
        </div>
      </div>

      {/* Studio Workspace Row */}
      <div className="studio-workspace-row" id="voice-studio-anchor" style={{ marginTop: "32px" }}>
        {/* AI Voice Studio Card */}
        <div className="glass-panel voice-studio-card" style={{ flex: 1.6 }}>
          <div className="studio-card-header">
            <h2 className="studio-card-title">
              <Sparkles size={16} style={{ color: "var(--color-secondary)", marginRight: "6px" }} /> AI Voice Studio
            </h2>
            <span className="studio-version-tag">Model: SpeechEngine v2.0-Ultra</span>
          </div>

          <div className="studio-form">
            {/* AI Script Assistant */}
            <div className="script-assistant-wrapper glass-panel" id="ai-script-assistant" style={{ marginBottom: "20px" }}>
              <div className="script-assistant-header">
                <PenTool size={14} className="assistant-icon" style={{ marginRight: "6px" }} />
                <span>AI Script Writer</span>
              </div>
              <div className="script-assistant-row" style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <input
                  type="text"
                  placeholder="Describe the script (e.g., 'A 30-second Facebook Reel promoting voice cloning')..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="button" className="btn btn-primary btn-sm btn-glow-hover" onClick={handleAIWriter}>
                  <Wand2 size={12} style={{ marginRight: "4px" }} /> <span>Write with AI</span>
                </button>
              </div>
            </div>

            {/* Text Editor Pane */}
            <div className="studio-input-group">
              <div className="editor-header-controls" style={{ display: "flex", justifyContent: "space-between" }}>
                <label htmlFor="editorText">Enter Speech Script</label>
                <div className="editor-actions" style={{ display: "flex", gap: "8px" }}>
                  <button type="button" className="editor-btn" title="Clear text" onClick={() => setEditorText("")}>
                    <Trash2 size={14} />
                  </button>
                  <button type="button" className="editor-btn" title="Add 1s Pause" onClick={insertPause}>
                    <Timer size={14} style={{ marginRight: "4px" }} /> <span>Pause</span>
                  </button>
                </div>
              </div>
              <textarea
                id="editorText"
                placeholder="Type or paste scripts here..."
                value={editorText}
                onChange={(e) => setEditorText(e.target.value.substring(0, 5000))}
                style={{ minHeight: "150px" }}
              />
              <div className="char-counter-row" style={{ textAlign: "right", fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "4px" }}>
                <div className="char-counter">
                  <span>{editorText.length}</span> / 5000 chars
                </div>
              </div>
            </div>

            {/* Configuration Selects & Sliders */}
            <div className="studio-controls-row" style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
              <div className="studio-control-item" style={{ flex: 1 }}>
                <label htmlFor="dashboardVoice">Voice Actor</label>
                <div className="custom-select">
                  <select id="dashboardVoice" value={chosenVoice} onChange={(e) => setChosenVoice(e.target.value)}>
                    <option value="Nova">Nova (Female - Explainer)</option>
                    <option value="Aero">Aero (Male - Narrative)</option>
                  </select>
                </div>
              </div>

              <div className="studio-control-item" style={{ flex: 1 }}>
                <label htmlFor="dashboardLanguage">Language</label>
                <div className="custom-select">
                  <select id="dashboardLanguage" value={chosenLanguage} onChange={(e) => setChosenLanguage(e.target.value)}>
                    <option value="en">English (US)</option>
                    <option value="ur">Urdu (اردو)</option>
                    <option value="es">Spanish (Español)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="studio-controls-row" style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
              <div className="studio-control-item" style={{ flex: 1 }}>
                <label>Speed Rate: {speedVal.toFixed(2)}x</label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={speedVal}
                  onChange={(e) => setSpeedVal(parseFloat(e.target.value))}
                  className="premium-slider"
                />
              </div>

              <div className="studio-control-item" style={{ flex: 1 }}>
                <label>Pitch Deviation: {pitchVal >= 0 ? `+${pitchVal}` : pitchVal}%</label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="5"
                  value={pitchVal}
                  onChange={(e) => setPitchVal(parseInt(e.target.value))}
                  className="premium-slider"
                />
              </div>
            </div>

            {/* Canvas Waveform Box */}
            <div className="visualizer-container" style={{ marginTop: "20px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", position: "relative" }}>
              {isSynthesizing && (
                <div className="visualizer-overlay" style={{ display: "flex", gap: "8px", color: "var(--color-warning)" }}>
                  <Volume2 size={16} className="pulse-icon" />
                  <span>Synthesizing voice stream...</span>
                </div>
              )}
              {isPlaying && (
                <div className="visualizer-overlay" style={{ display: "flex", gap: "8px", color: "var(--color-secondary)" }}>
                  <Volume2 size={16} className="pulse-icon" />
                  <span>Playing Preview...</span>
                </div>
              )}
              {!isSynthesizing && !isPlaying && (
                <div className="visualizer-overlay" style={{ display: "flex", gap: "8px", color: "var(--color-text-muted)" }}>
                  <CheckCircle size={16} style={{ color: audioUrl ? "var(--color-success)" : "" }} />
                  <span>{audioUrl ? "Audio Stream Ready" : "Ready for Synthesis"}</span>
                </div>
              )}
              <canvas ref={canvasRef} style={{ width: "100%", height: "80px", display: "block" }} />
            </div>

            <div className="studio-actions" style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button className="btn btn-primary btn-full" onClick={handleGenerateSpeech}>
                {isSynthesizing ? (
                  <>Processing...</>
                ) : isPlaying ? (
                  <>
                    <Square size={14} style={{ marginRight: "6px" }} /> Stop Playback
                  </>
                ) : (
                  <>
                    <Sparkles size={14} style={{ marginRight: "6px" }} /> Generate Speech
                  </>
                )}
              </button>
              <button className="btn btn-secondary" onClick={() => showToast("Downloading audio stream...")} disabled={!audioUrl}>
                <Download size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar Details */}
        <div className="glass-panel info-summary-card" style={{ flex: 0.9, padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--color-text)" }}>Node Node Telemetry</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
              <span style={{ color: "var(--color-text-muted)" }}>Active Language:</span>
              <span style={{ fontWeight: 500 }}>{chosenLanguage === "en" ? "English (US)" : chosenLanguage === "ur" ? "Urdu" : "Spanish"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
              <span style={{ color: "var(--color-text-muted)" }}>Voice Model:</span>
              <span style={{ fontWeight: 500 }}>{chosenVoice} (Studio HD+)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
              <span style={{ color: "var(--color-text-muted)" }}>Est. Duration:</span>
              <span style={{ fontWeight: 500 }}>{(editorText.length * 0.06).toFixed(1)}s</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
              <span style={{ color: "var(--color-text-muted)" }}>API Endpoints Status:</span>
              <span style={{ color: "var(--color-success)", fontWeight: 600 }}>Active</span>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "16px", marginTop: "auto" }}>
            <h4 style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "12px" }}>Quick Configurations</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button className="btn btn-outline btn-sm btn-full" onClick={() => { setSpeedVal(0.9); setPitchVal(5); showToast("Applied Warm preset."); }}>Warm Narrator (0.9x, +5%)</button>
              <button className="btn btn-outline btn-sm btn-full" onClick={() => { setSpeedVal(1.2); setPitchVal(-10); showToast("Applied Podcast preset."); }}>Fast Podcast (1.2x, -10%)</button>
            </div>
          </div>
        </div>
      </div>

      {/* Trending AI Voices */}
      <section className="trending-voices-section" style={{ marginTop: "40px" }}>
        <h2 className="section-title-alt">Trending AI Voices</h2>
        <p className="section-subtitle-alt">Preview and select the most popular neural voice profiles in the studio library.</p>
        
        <div className="voices-scroll-container" style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "12px" }}>
          <div className="voice-profile-card glass-panel" style={{ minWidth: "260px" }}>
            <div className="voice-card-header-row">
              <div className="voice-avatar" style={{ background: "linear-gradient(135deg, #6C63FF 0%, #00C2FF 100%)" }}>NV</div>
              <div className="voice-card-meta">
                <h4 className="voice-name">Nova</h4>
                <span className="voice-tag">Female Professional</span>
              </div>
            </div>
            <p className="voice-card-description">Warm, friendly, and structured. Best for explainer clips, ads, and video summaries.</p>
            <div className="voice-card-actions" style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <button className="btn btn-secondary btn-sm" onClick={() => { setChosenVoice("Nova"); showToast("Nova voice selected."); }}><Play size={10} /> Select</button>
              <button className="btn btn-outline btn-sm" onClick={() => showToast("Playing Nova voice demo...")}>Preview</button>
            </div>
          </div>

          <div className="voice-profile-card glass-panel" style={{ minWidth: "260px" }}>
            <div className="voice-card-header-row">
              <div className="voice-avatar" style={{ background: "linear-gradient(135deg, #00C2FF 0%, #00FFC2 100%)" }}>AR</div>
              <div className="voice-card-meta">
                <h4 className="voice-name">Aero</h4>
                <span className="voice-tag">Male Narrator</span>
              </div>
            </div>
            <p className="voice-card-description">Deep, engaging, and rich. Ideal for documentary films, audiobooks, and reports.</p>
            <div className="voice-card-actions" style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <button className="btn btn-secondary btn-sm" onClick={() => { setChosenVoice("Aero"); showToast("Aero voice selected."); }}><Play size={10} /> Select</button>
              <button className="btn btn-outline btn-sm" onClick={() => showToast("Playing Aero voice demo...")}>Preview</button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Audio Generations */}
      <section className="recent-generations-section" style={{ marginTop: "40px" }}>
        <div className="recent-gen-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="section-title-alt">Recent Audio Generations</h2>
          <span className="recent-gen-quota" style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Quota utilized: 3 tracks</span>
        </div>

        <div className="generations-grid" style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
          {recentTracks.map((track) => (
            <div key={track.id} className="generation-card glass-panel" style={{ display: "flex", alignItems: "center", padding: "16px", justifyContent: "space-between" }}>
              <button className="gen-play-btn" onClick={() => handlePlayRecent(track)} style={{ marginRight: "16px" }}>
                <Play size={14} fill="currentColor" />
              </button>
              <div className="gen-title-meta" style={{ flex: 1 }}>
                <h4 className="gen-track-title" style={{ fontSize: "0.95rem", fontWeight: 600 }}>{track.title}</h4>
                <span className="gen-track-details" style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                  Voice: {track.voice} | {track.lang} | {track.date}
                </span>
              </div>
              <span className="gen-duration" style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginRight: "16px" }}>{track.duration}</span>
              <button className="gen-action-btn" onClick={() => showToast("Opening track actions...")}>
                <MoreVertical size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Toast popup */}
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






