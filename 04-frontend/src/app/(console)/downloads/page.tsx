"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Download,
  Play,
  Pause,
  Trash2,
  Music,
  Clock,
  FileAudio,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Volume2,
} from "lucide-react";

interface HistoryEntry {
  id: string;
  downloadId: string;
  voiceName: string;
  text: string;
  duration: number;
  charCount: number;
  sizeBytes: number;
  format: string;
  modelId: string;
  createdAt: string;
  audioUrl: string;
  fileExists: boolean;
}

export default function DownloadsPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchHistory = async (token: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("https://voice-nova-sooty.vercel.app/api/elevenlabs/history?limit=100", { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) {
        setHistory(data.data || []);
      } else {
        setError(data.message || "Failed to load history.");
      }
    } catch (err) {
      setError("Could not connect to server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const sessionRes = await fetch("/api/auth/session");
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData.authenticated && sessionData.token) {
            setSessionToken(sessionData.token);
            fetchHistory(sessionData.token);
            return;
          }
        }
      } catch {}
      fetchHistory(null);
    }
    init();
  }, []);

  const handlePlay = (entry: HistoryEntry) => {
    if (!entry.fileExists) {
      showToast("Audio file no longer exists on server.", "error");
      return;
    }

    if (playingId === entry.downloadId) {
      // Stop current
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audioUrl = `https://voice-nova-sooty.vercel.app/api/elevenlabs/audio/${entry.downloadId}`;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.play().then(() => {
      setPlayingId(entry.downloadId);
    }).catch(() => {
      showToast("Could not play audio.", "error");
      setPlayingId(null);
    });

    audio.onended = () => setPlayingId(null);
    audio.onerror = () => {
      setPlayingId(null);
      showToast("Playback error.", "error");
    };
  };

  const handleDelete = async (entry: HistoryEntry) => {
    if (!confirm("Are you sure you want to delete this audio?")) return;
    try {
      const res = await fetch("https://voice-nova-sooty.vercel.app/api/elevenlabs/audio/" + entry.downloadId, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + sessionToken }
      });
      if (res.ok) {
        showToast("Audio deleted successfully!");
        setHistory(prev => prev.filter(h => h.downloadId !== entry.downloadId));
        if (playingId === entry.downloadId) {
          audioRef.current?.pause();
          setPlayingId(null);
        }
      } else {
        showToast("Failed to delete audio.", "error");
      }
    } catch (err) {
      showToast("Network error while deleting.", "error");
    }
  };

  const handleDownload = (entry: HistoryEntry) => {
    if (!entry.fileExists) {
      showToast("Audio file no longer available for download.", "error");
      return;
    }
    showToast("✓ Download started!");
    window.location.href = `https://voice-nova-sooty.vercel.app/api/elevenlabs/audio/${entry.downloadId}?download=1`;
  };
  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="dash-workspace" style={{ maxWidth: "1100px", margin: "0 auto" }}>

      {/* Page Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--color-text)", marginBottom: "8px" }}>
              Downloads & History
            </h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem" }}>
              All your generated audio files — play, download, or review your synthesis history.
            </p>
          </div>
          <button
            onClick={() => fetchHistory(sessionToken)}
            disabled={loading}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 20px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)", color: "var(--color-text)", cursor: "pointer",
              fontSize: "0.85rem", fontWeight: 500,
            }}
          >
            <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
            Refresh
          </button>
        </div>

        {/* Stats Row */}
        {!loading && !error && (
          <div style={{ display: "flex", gap: "16px", marginTop: "20px" }}>
            {[
              { label: "Total Tracks", value: history.length, icon: Music },
              { label: "Available", value: history.filter((h) => h.fileExists).length, icon: CheckCircle },
              { label: "Total Duration", value: formatDuration(history.reduce((a, h) => a + h.duration, 0)), icon: Clock },
              { label: "Total Size", value: formatBytes(history.reduce((a, h) => a + h.sizeBytes, 0)), icon: FileAudio },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="glass-panel" style={{ flex: 1, padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "38px", height: "38px", borderRadius: "10px",
                  background: "linear-gradient(135deg, rgba(108,99,255,0.3), rgba(0,194,255,0.3))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={16} style={{ color: "#6C63FF" }} />
                </div>
                <div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-text)" }}>{value}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content Area */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: "16px" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "50%",
            border: "3px solid rgba(108,99,255,0.2)", borderTopColor: "#6C63FF",
            animation: "spin 0.8s linear infinite",
          }} />
          <p style={{ color: "var(--color-text-muted)" }}>Loading your audio history...</p>
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ padding: "40px", textAlign: "center" }}>
          <AlertCircle size={40} style={{ color: "var(--color-error, #ef4444)", marginBottom: "12px" }} />
          <h3 style={{ color: "var(--color-text)", marginBottom: "8px" }}>Could Not Load History</h3>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "20px" }}>{error}</p>
          <button
            onClick={() => fetchHistory(sessionToken)}
            style={{
              padding: "10px 24px", borderRadius: "8px", border: "none",
              background: "linear-gradient(135deg, #6C63FF, #00C2FF)",
              color: "white", fontWeight: 600, cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      ) : history.length === 0 ? (
        <div className="glass-panel" style={{ padding: "60px 40px", textAlign: "center" }}>
          <Volume2 size={48} style={{ color: "rgba(108,99,255,0.4)", marginBottom: "16px" }} />
          <h3 style={{ color: "var(--color-text)", marginBottom: "8px" }}>No Downloads Yet</h3>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "24px" }}>
            Generate your first voice in the Studio and it will appear here.
          </p>
          <a
            href="/studio"
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "12px 28px", borderRadius: "8px",
              background: "linear-gradient(135deg, #6C63FF, #00C2FF)",
              color: "white", fontWeight: 600, textDecoration: "none",
            }}
          >
            Go to Studio
          </a>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {history.map((entry) => (
            <div
              key={entry.downloadId}
              className="glass-panel"
              style={{
                display: "flex", alignItems: "center", padding: "18px 20px", gap: "16px",
                borderLeft: `3px solid ${entry.fileExists ? "rgba(108,99,255,0.5)" : "rgba(255,100,100,0.4)"}`,
                transition: "all 0.2s ease",
              }}
            >
              {/* Play button */}
              <button
                onClick={() => handlePlay(entry)}
                disabled={!entry.fileExists}
                title={entry.fileExists ? "Play audio" : "File no longer available"}
                style={{
                  width: "42px", height: "42px", borderRadius: "50%", border: "none",
                  background: playingId === entry.downloadId
                    ? "linear-gradient(135deg, #00C2FF, #6C63FF)"
                    : entry.fileExists
                      ? "linear-gradient(135deg, #6C63FF, #00C2FF)"
                      : "rgba(255,255,255,0.05)",
                  color: "white", cursor: entry.fileExists ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, boxShadow: entry.fileExists ? "0 0 16px rgba(108,99,255,0.4)" : "none",
                  transition: "all 0.2s ease",
                }}
              >
                {playingId === entry.downloadId
                  ? <Pause size={16} fill="white" />
                  : <Play size={16} fill="white" style={{ marginLeft: "2px" }} />
                }
              </button>

              {/* Track Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <h4 style={{
                    fontSize: "0.95rem", fontWeight: 600, color: "var(--color-text)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {entry.voiceName} — Synthesis
                  </h4>
                  {entry.fileExists ? (
                    <span style={{
                      fontSize: "0.65rem", padding: "2px 8px", borderRadius: "100px",
                      background: "rgba(34,197,94,0.15)", color: "#22c55e", fontWeight: 600,
                    }}>AVAILABLE</span>
                  ) : (
                    <span style={{
                      fontSize: "0.65rem", padding: "2px 8px", borderRadius: "100px",
                      background: "rgba(239,68,68,0.15)", color: "#ef4444", fontWeight: 600,
                    }}>EXPIRED</span>
                  )}
                </div>
                <p style={{
                  fontSize: "0.78rem", color: "var(--color-text-muted)", margin: 0,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  maxWidth: "450px",
                }}>
                  {entry.text}
                </p>
              </div>

              {/* Meta */}
              <div style={{ display: "flex", gap: "20px", alignItems: "center", flexShrink: 0 }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-text)", fontWeight: 500 }}>
                    {formatDuration(entry.duration)}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
                    {formatBytes(entry.sizeBytes)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                    {entry.charCount} chars
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
                    {formatDate(entry.createdAt)}
                  </div>
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={() => handleDownload(entry)}
                disabled={!entry.fileExists || downloadingId === entry.downloadId}
                title={entry.fileExists ? "Download MP3" : "File no longer available"}
                style={{
                  display: "flex", alignItems: "center", gap: "7px",
                  padding: "9px 16px", borderRadius: "8px",
                  background: !entry.fileExists
                    ? "rgba(255,255,255,0.04)"
                    : downloadingId === entry.downloadId
                      ? "rgba(108,99,255,0.3)"
                      : "linear-gradient(135deg, rgba(108,99,255,0.25), rgba(0,194,255,0.25))",
                  color: entry.fileExists ? "var(--color-text)" : "var(--color-text-muted)",
                  cursor: entry.fileExists ? "pointer" : "not-allowed",
                  fontSize: "0.82rem", fontWeight: 600, flexShrink: 0,
                  border: "1px solid rgba(108,99,255,0.25)",
                  transition: "all 0.2s ease",
                }}
              >
                <Download size={13} />
                {downloadingId === entry.downloadId ? "Downloading..." : "MP3"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed", bottom: "24px", right: "24px",
            padding: "12px 24px", borderRadius: "8px", zIndex: 5000,
            background: "rgba(15,15,25,0.95)", backdropFilter: "blur(16px)",
            borderLeft: `4px solid ${toast.type === "success" ? "#22c55e" : "#ef4444"}`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", gap: "10px",
            animation: "slideIn 0.3s ease forwards",
          }}
        >
          <span style={{ fontWeight: 700, color: toast.type === "success" ? "#22c55e" : "#ef4444" }}>
            {toast.type === "success" ? "✓" : "✗"}
          </span>
          <span style={{ color: "var(--color-text)", fontSize: "0.9rem" }}>{toast.message}</span>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
}

