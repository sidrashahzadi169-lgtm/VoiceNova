"use client";

import React, { useState } from "react";
import {
  Key,
  Eye,
  EyeOff,
  Copy,
  BookOpen,
  Code,
  CheckCircle,
} from "lucide-react";

export default function ApiConsole() {
  const [primaryKey, setPrimaryKey] = useState("vn_live_d84f9328a9b2d83c27e8a931d8e12c80");
  const [secretKey, setSecretKey] = useState("vn_sec_42fa918b951c3d18e2c3817f920da3e9");

  const [isPrimaryMasked, setIsPrimaryMasked] = useState(true);
  const [isSecretMasked, setIsSecretMasked] = useState(true);

  const [codeTab, setCodeTab] = useState<"javascript" | "python" | "node" | "php">("javascript");

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopy = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    showToast(`${label} copied to clipboard!`);
  };

  const handleRegenPrimary = () => {
    const nextKey = "vn_live_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setPrimaryKey(nextKey);
    showToast("Primary API Live Key regenerated successfully!");
  };

  const handleRegenSecret = () => {
    const nextKey = "vn_sec_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setSecretKey(nextKey);
    showToast("Secret Authentication Auth Key regenerated successfully!");
  };

  const codeSnippets = {
    javascript: `fetch('https://api.voicenova.ai/v1/text-to-speech', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <YOUR_KEY>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: "Welcome to VoiceNova. Experience neural speech.",
    voice: "Nova",
    output_format: "mp3"
  })
})
.then(res => res.blob())
.then(audioBlob => {
  const audioUrl = URL.createObjectURL(audioBlob);
  new Audio(audioUrl).play();
});`,
    python: `import requests

url = 'https://api.voicenova.ai/v1/text-to-speech'
headers = {
    'Authorization': 'Bearer <YOUR_KEY>',
    'Content-Type': 'application/json'
}
data = {
    'text': "Welcome to VoiceNova. Experience neural speech.",
    'voice': "Nova",
    'output_format': "mp3"
}

response = requests.post(url, headers=headers, json=data)

with open('output.mp3', 'wb') as f:
    f.write(response.content)`,
    node: `const axios = require('axios');
const fs = require('fs');

axios.post('https://api.voicenova.ai/v1/text-to-speech', {
  text: "Welcome to VoiceNova. Experience neural speech.",
  voice: "Nova"
}, {
  headers: {
    'Authorization': 'Bearer <YOUR_KEY>',
    'responseType': 'arraybuffer'
  }
})
.then(res => {
  fs.writeFileSync('output.mp3', res.data);
});`,
    php: `<?php
$ch = curl_init('https://api.voicenova.ai/v1/text-to-speech');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer <YOUR_KEY>',
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'text' => 'Welcome to VoiceNova. Experience neural speech.',
    'voice' => 'Nova'
]));

$output = curl_exec($ch);
file_put_contents('output.mp3', $output);
curl_close($ch);
?>`,
  };

  return (
    <div className="dash-workspace">
      
      {/* Stats row overview */}
      <div className="dashboard-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        <div className="stat-card glass-panel" style={{ padding: "20px" }}>
          <span className="stat-label" style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>API Status</span>
          <div className="api-status-row" style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
            <span className="avatar-status-dot" style={{ position: "static", display: "inline-block", background: "#22C55E", boxShadow: "0 0 10px rgba(34,197,94,0.4)", width: "8px", height: "8px" }}></span>
            <span className="stat-num" style={{ margin: 0, fontSize: "1.2rem", fontWeight: 600 }}>Operational</span>
          </div>
        </div>

        <div className="stat-card glass-panel" style={{ padding: "20px" }}>
          <span className="stat-label" style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Current Plan</span>
          <span className="stat-num" style={{ display: "block", fontSize: "1.2rem", fontWeight: 600, marginTop: "8px" }}>Developer Pro</span>
        </div>

        <div className="stat-card glass-panel" style={{ padding: "20px" }}>
          <span className="stat-label" style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Monthly Requests</span>
          <span className="stat-num" style={{ display: "block", fontSize: "1.2rem", fontWeight: 600, marginTop: "8px" }}>12,450 / 50,000</span>
        </div>

        <div className="stat-card glass-panel" style={{ padding: "20px" }}>
          <span className="stat-label" style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Remaining Quota</span>
          <span className="stat-num" style={{ display: "block", fontSize: "1.2rem", fontWeight: 600, marginTop: "8px" }}>37,550 Hits</span>
        </div>
      </div>

      {/* Active Project keys */}
      <div className="glass-panel settings-card-group" style={{ padding: "24px", marginBottom: "32px" }}>
        <h3 className="settings-group-title" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Key size={16} style={{ color: "var(--color-secondary)" }} /> Active Project API Keys
        </h3>
        
        <div className="settings-fields-form" style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>
          
          {/* Primary Live API Key */}
          <div className="form-group">
            <label>Primary Live API Key</label>
            <div className="api-key-copy-row" style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
              <input
                type={isPrimaryMasked ? "password" : "text"}
                value={primaryKey}
                readOnly
                style={{ flex: 1, fontFamily: "monospace", fontSize: "0.82rem" }}
              />
              <button className="btn btn-secondary btn-icon-only" onClick={() => setIsPrimaryMasked(!isPrimaryMasked)}>
                {isPrimaryMasked ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button className="btn btn-secondary btn-icon-only" onClick={() => handleCopy(primaryKey, "Primary API Key")}>
                <Copy size={14} />
              </button>
            </div>
          </div>

          {/* Secret Auth Key */}
          <div className="form-group">
            <label>Secret Auth Key</label>
            <div className="api-key-copy-row" style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
              <input
                type={isSecretMasked ? "password" : "text"}
                value={secretKey}
                readOnly
                style={{ flex: 1, fontFamily: "monospace", fontSize: "0.82rem" }}
              />
              <button className="btn btn-secondary btn-icon-only" onClick={() => setIsSecretMasked(!isSecretMasked)}>
                {isSecretMasked ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button className="btn btn-secondary btn-icon-only" onClick={() => handleCopy(secretKey, "Secret Auth Key")}>
                <Copy size={14} />
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <button className="btn btn-primary btn-glow-hover" onClick={handleRegenPrimary}>Regenerate Primary Key</button>
            <button className="btn btn-outline" onClick={handleRegenSecret}>Regenerate Secret Key</button>
          </div>
        </div>
      </div>

      {/* Docs and Snippets layout splits */}
      <div className="library-workspace-layout" style={{ display: "flex", gap: "24px" }}>
        
        {/* Left Column Documentation Reference */}
        <div className="library-center-area" style={{ flex: 1.4 }}>
          <div className="glass-panel settings-card-group" style={{ padding: "24px" }}>
            <h3 className="settings-group-title" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <BookOpen size={16} style={{ color: "var(--color-primary)" }} /> API Reference Documentation
            </h3>
            
            <div className="api-docs-endpoints-list" style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "20px" }}>
              <div className="endpoint-item" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", paddingBottom: "16px" }}>
                <h4 style={{ fontSize: "0.88rem", fontWeight: 700, color: "white", marginBottom: "4px" }}>Authentication Headers</h4>
                <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", marginBottom: "8px" }}>Authenticate request frames by passing keys inside Bearer headers.</p>
                <code style={{ fontSize: "0.75rem", background: "rgba(0,0,0,0.2)", padding: "4px 8px", borderRadius: "4px", color: "var(--color-secondary)" }}>Authorization: Bearer YOUR_API_KEY</code>
              </div>

              <div className="endpoint-item" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", paddingBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span className="status-badge" style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E" }}>POST</span>
                  <code style={{ fontSize: "0.82rem", fontWeight: 700, color: "white" }}>/v1/text-to-speech</code>
                </div>
                <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)" }}>Synthesizes raw script text strings into neural MP3/WAV waveforms stream buffers.</p>
              </div>

              <div className="endpoint-item" style={{ paddingBottom: "0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span className="status-badge" style={{ background: "rgba(0,194,255,0.15)", color: "var(--color-secondary)" }}>GET</span>
                  <code style={{ fontSize: "0.82rem", fontWeight: 700, color: "white" }}>/v1/voices</code>
                </div>
                <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)" }}>Retrieves metadata profiles representing available synthetic actors.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column Code Examples */}
        <div className="library-right-panel" style={{ flex: 1.6 }}>
          <div className="glass-panel settings-card-group" style={{ padding: "24px", display: "flex", flexDirection: "column", height: "100%" }}>
            <h3 className="settings-group-title" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <Code size={16} style={{ color: "var(--color-secondary)" }} /> Code Snippet Examples
            </h3>
            
            <div className="category-tabs-bar" style={{ display: "flex", gap: "4px", margin: "16px 0 12px 0" }}>
              {[
                { id: "javascript", label: "JS" },
                { id: "python", label: "Python" },
                { id: "node", label: "Node" },
                { id: "php", label: "PHP" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`tab-btn ${codeTab === tab.id ? "active" : ""}`}
                  style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                  onClick={() => setCodeTab(tab.id as any)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <pre
              className="code-box active"
              style={{
                fontFamily: "monospace",
                fontSize: "0.75rem",
                padding: "16px",
                background: "rgba(0,0,0,0.3)",
                borderRadius: "8px",
                overflowX: "auto",
                color: "#C5C8C6",
                border: "1px solid rgba(255,255,255,0.05)",
                whiteSpace: "pre-wrap",
                flex: 1,
              }}
            >
              {codeSnippets[codeTab]}
            </pre>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
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
