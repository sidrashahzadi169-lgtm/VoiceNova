"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Palette,
  Moon,
  Sun,
  Monitor,
  Bell,
  Lock,
  Shield,
  Smartphone,
  Trash2,
  Code2,
  Database,
  Key,
} from "lucide-react";

export default function Settings() {
  const [activePane, setActivePane] = useState<"general-appearance" | "notifications-ai" | "security-sessions" | "api-storage">("general-appearance");

  // General settings state
  const [fullName, setFullName] = useState("Sidra Rehman");
  const [username, setUsername] = useState("sidra_nova");
  const [sysLanguage, setSysLanguage] = useState("en");
  const [timezone, setTimezone] = useState("karachi");
  const [dateFormat, setDateFormat] = useState("dd-mm-yyyy");

  useEffect(() => {
    async function initSettings() {
      try {
        const sessionRes = await fetch("/api/auth/session");
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData.authenticated && sessionData.token) {
            setSessionToken(sessionData.token);
            
            // Get profile
            const profileRes = await fetch("https://voice-nova-sooty.vercel.app/api/users/profile", {
              headers: { "Authorization": "Bearer " + sessionData.token }
            });
            if (profileRes.ok) {
              const pData = await profileRes.json();
              if (pData.success && pData.data) {
                setFullName(pData.data.name);
                setUsername(pData.data.email);
              }
            }
            
            // Get API Keys
            loadApiKeys(sessionData.token);
          }
        }
      } catch (err) {}
    }
    initSettings();
  }, []);

  // Appearance state
  const [themeMode, setThemeMode] = useState("dark");
  const [accentColor, setAccentColor] = useState("purple");

  // Notifications state
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyPush, setNotifyPush] = useState(true);

  // Security state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  // API Key & Storage state
  const [apiKey, setApiKey] = useState("");
  const [isKeyMasked, setIsKeyMasked] = useState(true);
  const [apiKeysList, setApiKeysList] = useState<any[]>([]);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  
  const loadApiKeys = async (token: string) => {
    try {
      const res = await fetch("https://voice-nova-sooty.vercel.app/api/users/apikeys", {
        headers: { "Authorization": "Bearer " + token }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setApiKeysList(data.data);
          if (data.data.length > 0) {
            setApiKey(data.data[0].maskedKey);
          }
        }
      }
    } catch (err) {}
  };

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleGeneralSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionToken) return;
    try {
      const res = await fetch("https://voice-nova-sooty.vercel.app/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + sessionToken
        },
        body: JSON.stringify({ name: fullName })
      });
      if (res.ok) {
        showToast("General settings updated successfully!");
        if (typeof window !== "undefined") {
          localStorage.setItem("userFullName", fullName);
        }
      } else {
        showToast("Failed to update profile", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    }
  };

  const handleSecuritySave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match!", "error");
      return;
    }
    if (!sessionToken) return;
    try {
      const res = await fetch("https://voice-nova-sooty.vercel.app/api/users/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + sessionToken
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        showToast("Password updated successfully!");
      } else {
        showToast(data.message || "Failed to update password", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    }
  };

  const handleClearCache = () => {
    showToast("Successfully cleared 124.5 MB of browser cached speech models!");
  };

  const handleRegenKey = async () => {
    if (!sessionToken) return;
    try {
      const res = await fetch("https://voice-nova-sooty.vercel.app/api/users/apikeys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + sessionToken
        },
        body: JSON.stringify({ name: "Live API Key" })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setApiKey(data.data.rawKey);
        setIsKeyMasked(false);
        showToast("New API key generated! Please copy it now.");
        loadApiKeys(sessionToken);
      } else {
        showToast("Failed to generate key", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    }
  };

  return (
    <div className="dash-workspace">
      
      {/* Settings Split layout wrapper */}
      <div className="settings-workspace-split" style={{ display: "flex", gap: "24px" }}>
        
        {/* Left Subtabs sidebar panel */}
        <aside className="settings-sub-tabs glass-panel" style={{ flex: 0.8, padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {[
            { id: "general-appearance", label: "General & Theme", icon: User },
            { id: "notifications-ai", label: "Notifications & AI", icon: Bell },
            { id: "security-sessions", label: "Security & Sessions", icon: Lock },
            { id: "api-storage", label: "API Key & Storage", icon: Code2 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`settings-tab-link ${activePane === tab.id ? "active" : ""}`}
                onClick={() => setActivePane(tab.id as any)}
                style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "12px", borderRadius: "8px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: "0.85rem" }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Right Details panes scroll column */}
        <div className="settings-panes-container" style={{ flex: 2.2 }}>
          
          {/* PANE 1: GENERAL & APPEARANCE */}
          {activePane === "general-appearance" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* General settings */}
              <div className="glass-panel settings-card-group" style={{ padding: "24px" }}>
                <h3 className="settings-group-title"><User size={16} style={{ marginRight: "6px", display: "inline" }} /> General Settings</h3>
                <form className="settings-fields-form" onSubmit={handleGeneralSave} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
                  <div className="form-row-split" style={{ display: "flex", gap: "16px" }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label htmlFor="setFullName">Full Name</label>
                      <input type="text" id="setFullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label htmlFor="setUsername">Username</label>
                      <input type="text" id="setUsername" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                  </div>

                  <div className="form-row-split" style={{ display: "flex", gap: "16px" }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label htmlFor="setLanguage">System Language</label>
                      <div className="custom-select">
                        <select id="setLanguage" value={sysLanguage} onChange={(e) => setSysLanguage(e.target.value)}>
                          <option value="en">English (US)</option>
                          <option value="ur">Urdu (PK)</option>
                          <option value="ar">Arabic (AE)</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label htmlFor="setTimezone">Time Zone</label>
                      <div className="custom-select">
                        <select id="setTimezone" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                          <option value="karachi">Asia/Karachi (GMT+5)</option>
                          <option value="london">Europe/London (GMT+0)</option>
                          <option value="newyork">America/New_York (GMT-5)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="setDateFormat">Date Format</label>
                    <div className="custom-select">
                      <select id="setDateFormat" value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}>
                        <option value="dd-mm-yyyy">DD/MM/YYYY (15/07/2026)</option>
                        <option value="mm-dd-yyyy">MM/DD/YYYY (07/15/2026)</option>
                        <option value="yyyy-mm-dd">YYYY-MM-DD (2026-07-15)</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary btn-glow-hover" style={{ width: "max-content" }}>Save General Settings</button>
                </form>
              </div>

              {/* Console Theme Appearance */}
              <div className="glass-panel settings-card-group" style={{ padding: "24px" }}>
                <h3 className="settings-group-title"><Palette size={16} style={{ marginRight: "6px", display: "inline" }} /> Console Appearance</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
                  <div className="form-group">
                    <label>Interface Theme Mode</label>
                    <div className="theme-option-row" style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                      {[
                        { id: "dark", label: "Dark Mode", icon: Moon },
                        { id: "light", label: "Light Mode", icon: Sun },
                        { id: "system", label: "System Theme", icon: Monitor },
                      ].map((t) => {
                        const Icon = t.icon;
                        return (
                          <div
                            key={t.id}
                            className={`theme-box ${themeMode === t.id ? "active" : ""}`}
                            onClick={() => { setThemeMode(t.id); showToast(`Applied ${t.label} theme!`); }}
                            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)", cursor: "pointer" }}
                          >
                            <Icon size={20} style={{ marginBottom: "8px" }} />
                            <span style={{ fontSize: "0.75rem" }}>{t.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Dashboard Accent Color</label>
                    <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                      {[
                        { id: "purple", color: "#6C63FF" },
                        { id: "cyan", color: "#00C2FF" },
                        { id: "green", color: "#22C55E" },
                        { id: "pink", color: "#EC4899" },
                      ].map((c) => (
                        <button
                          key={c.id}
                          className={`accent-dot-btn ${accentColor === c.id ? "active" : ""}`}
                          onClick={() => { setAccentColor(c.id); showToast(`Applied ${c.id} theme accent.`); }}
                          style={{ width: "24px", height: "24px", borderRadius: "50%", background: c.color, border: accentColor === c.id ? "2px solid white" : "none", cursor: "pointer" }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PANE 2: NOTIFICATIONS & AI */}
          {activePane === "notifications-ai" && (
            <div className="glass-panel settings-card-group" style={{ padding: "24px" }}>
              <h3 className="settings-group-title"><Bell size={16} style={{ marginRight: "6px", display: "inline" }} /> Notifications & AI Preferences</h3>
              
              <div className="settings-switches-list" style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, display: "block" }}>Email Notifications</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Receive account security updates and quota balance alerts.</span>
                  </div>
                  <label className="pricing-switch">
                    <input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} />
                    <span className="pricing-slider" />
                  </label>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, display: "block" }}>Browser Push Notifications</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Show desktop notifications when neural voice synthesis finishes.</span>
                  </div>
                  <label className="pricing-switch">
                    <input type="checkbox" checked={notifyPush} onChange={(e) => setNotifyPush(e.target.checked)} />
                    <span className="pricing-slider" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* PANE 3: SECURITY & SESSIONS */}
          {activePane === "security-sessions" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="glass-panel settings-card-group" style={{ padding: "24px" }}>
                <h3 className="settings-group-title"><Lock size={16} style={{ marginRight: "6px", display: "inline" }} /> Update Credentials</h3>
                <form onSubmit={handleSecuritySave} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
                  <div className="form-group">
                    <label htmlFor="oldPw">Current Password</label>
                    <input type="password" id="oldPw" placeholder="••••••••" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
                  </div>
                  <div className="form-row-split" style={{ display: "flex", gap: "16px" }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label htmlFor="newPw">New Password</label>
                      <input type="password" id="newPw" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label htmlFor="confirmPw">Confirm Password</label>
                      <input type="password" id="confirmPw" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "16px" }}>
                    <Shield size={16} style={{ color: "var(--color-primary)" }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600, display: "block" }}>Two-Factor Authentication</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Confirm logins via connected mobile app.</span>
                    </div>
                    <label className="pricing-switch">
                      <input type="checkbox" checked={is2FAEnabled} onChange={(e) => { setIs2FAEnabled(e.target.checked); showToast(`2FA ${e.target.checked ? "enabled" : "disabled"}`); }} />
                      <span className="pricing-slider" />
                    </label>
                  </div>

                  <button type="submit" className="btn btn-primary btn-glow-hover" style={{ width: "max-content" }}>Update Password</button>
                </form>
              </div>
            </div>
          )}

          {/* PANE 4: API KEY & STORAGE */}
          {activePane === "api-storage" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="glass-panel settings-card-group" style={{ padding: "24px" }}>
                <h3 className="settings-group-title"><Key size={16} style={{ marginRight: "6px", display: "inline" }} /> API Authorization</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
                  <div className="form-group">
                    <label>Live Primary API Token Key</label>
                    <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                      <input
                        type={isKeyMasked ? "password" : "text"}
                        value={apiKey}
                        readOnly
                        style={{ flex: 1, fontFamily: "monospace", fontSize: "0.82rem" }}
                      />
                      <button className="btn btn-secondary btn-icon-only" onClick={() => setIsKeyMasked(!isKeyMasked)}>
                        {isKeyMasked ? "Reveal" : "Hide"}
                      </button>
                      <button className="btn btn-secondary btn-icon-only" onClick={() => { navigator.clipboard.writeText(apiKey); showToast("API Key copied to clipboard!"); }}>
                        Copy
                      </button>
                    </div>
                  </div>

                  <button className="btn btn-primary btn-glow-hover" onClick={handleRegenKey} style={{ width: "max-content" }}>Regenerate API Key</button>
                </div>
              </div>

              {/* Cloud Storage */}
              <div className="glass-panel settings-card-group" style={{ padding: "24px" }}>
                <h3 className="settings-group-title"><Database size={16} style={{ marginRight: "6px", display: "inline" }} /> Cloud Assets Storage</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                    <span style={{ color: "var(--color-text-muted)" }}>Total Quota Utilized:</span>
                    <span style={{ fontWeight: 600 }}>45.2 MB / 1.0 GB (4.5%)</span>
                  </div>
                  <div className="progress-bar-track" style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px" }}>
                    <div className="progress-bar-fill fill-secondary" style={{ height: "100%", width: "4.5%", background: "var(--color-secondary)", borderRadius: "3px" }} />
                  </div>
                  <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                    <button className="btn btn-outline" onClick={handleClearCache}>Clear Local Cache</button>
                    <button className="btn btn-outline color-red-btn" onClick={() => showToast("Requesting old projects purge...")}>Delete Old Drafts</button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

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
