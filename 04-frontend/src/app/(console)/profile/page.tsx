"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Check,
  CreditCard,
  Activity,
  Key,
  Shield,
  Monitor,
  Smartphone,
  Info,
} from "lucide-react";

interface SessionItem {
  id: string;
  device: string;
  location: string;
  status: "Active Now" | "Idle";
  browser: string;
  icon: any;
}

export default function Profile() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"edit-profile" | "security" | "preferences">("edit-profile");

  // User Profile details states
  const [fullName, setFullName] = useState("Sidra Rehman");
  const [username, setUsername] = useState("sidra_nova");
  const [email, setEmail] = useState("sidra.rehman@voicenova.ai");
  const [bio, setBio] = useState(
    "AI Voice Producer & Sound Designer. Crafting immersive podcasts and audiobooks with neural synthesis."
  );
  const [country, setCountry] = useState("Pakistan");
  const [timezone, setTimezone] = useState("Asia/Karachi (GMT+5)");

  // Read/Write values to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("userFullName");
      const storedEmail = localStorage.getItem("userEmail");
      if (storedName) {
        setFullName(storedName);
        setUsername(storedName.toLowerCase().replace(/\s+/g, "_"));
      }
      if (storedEmail) setEmail(storedEmail);
    }
  }, []);

  // Security password states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  // Preference states
  const [themeMode, setThemeMode] = useState("dark");
  const [notifyMarketing, setNotifyMarketing] = useState(true);
  const [notifyUpdates, setNotifyUpdates] = useState(true);

  // Connected integrations accounts
  const [connections, setConnections] = useState({
    google: true,
    github: false,
    microsoft: false,
  });

  // Active Sessions
  const [sessions, setSessions] = useState<SessionItem[]>([
    { id: "s1", device: "MacBook Pro M2", location: "Karachi, PK", status: "Active Now", browser: "Chrome v114", icon: Monitor },
    { id: "s2", device: "iPhone 14 Pro", location: "Karachi, PK", status: "Idle", browser: "Safari Mobile", icon: Smartphone },
  ]);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleEditProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("userFullName", fullName);
      localStorage.setItem("userEmail", email);
    }
    showToast("Profile details updated successfully!");
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match!", "error");
      return;
    }
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    showToast("Password updated successfully!");
  };

  const handleToggleConnection = (provider: "google" | "github" | "microsoft") => {
    setConnections((prev) => {
      const nextVal = !prev[provider];
      showToast(`${provider.toUpperCase()} account ${nextVal ? "connected" : "disconnected"}!`);
      return { ...prev, [provider]: nextVal };
    });
  };

  const handleTerminateSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    showToast("Session terminated successfully.");
  };

  return (
    <div className="dash-workspace">
      
      <div className="profile-layout-grid" style={{ display: "flex", gap: "24px" }}>
        
        {/* Left Column overview card */}
        <div className="profile-left-column" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Profile Overview Card */}
          <div className="glass-panel profile-overview-card" style={{ padding: "24px", position: "relative", overflow: "hidden" }}>
            <div className="profile-cover-glow" />
            
            <div className="profile-avatar-row" style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px" }}>
              <div className="profile-pic-wrapper" style={{ position: "relative" }}>
                <span className="profile-pic-letter" style={{ width: "64px", height: "64px", background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.8rem" }}>
                  {fullName.charAt(0)}
                </span>
                <button className="edit-pic-overlay-btn" title="Change Avatar" style={{ position: "absolute", bottom: "-4px", right: "-4px", background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", padding: "4px", cursor: "pointer" }}>
                  <Camera size={10} style={{ color: "#fff" }} />
                </button>
              </div>

              <div className="profile-name-meta">
                <h2 className="profile-full-name" style={{ fontSize: "1.2rem", fontWeight: 700 }}>{fullName}</h2>
                <span className="profile-username" style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>@{username}</span>
                <div className="email-verify-row" style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                  <span className="profile-email-label" style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{email}</span>
                  <span className="badge badge-success-active" style={{ fontSize: "0.6rem", padding: "2px 8px" }}>
                    <Check size={8} style={{ display: "inline-block", marginRight: "2px" }} /> Verified
                  </span>
                </div>
              </div>
            </div>

            <p className="profile-bio-text" style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "20px" }}>
              {bio}
            </p>

            <div className="profile-details-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: "16px" }}>
              <div className="profile-details-item" style={{ display: "flex", flexDirection: "column" }}>
                <span className="detail-label" style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Country</span>
                <span className="detail-value" style={{ fontSize: "0.85rem", fontWeight: 500 }}>{country}</span>
              </div>
              <div className="profile-details-item" style={{ display: "flex", flexDirection: "column" }}>
                <span className="detail-label" style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Time Zone</span>
                <span className="detail-value" style={{ fontSize: "0.85rem", fontWeight: 500 }}>{timezone}</span>
              </div>
            </div>
          </div>

          {/* Active Subscription details widget */}
          <div className="glass-panel profile-sub-widget" style={{ padding: "24px" }}>
            <h3 className="widget-title" style={{ display: "flex", gap: "6px", alignItems: "center", fontSize: "0.95rem", fontWeight: 600, marginBottom: "16px" }}>
              <CreditCard size={14} style={{ color: "var(--color-secondary)" }} /> Active Subscription
            </h3>
            
            <div className="sub-widget-content" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="sub-plan-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span className="plan-label" style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Plan Name</span>
                  <h4 className="plan-title-text" style={{ fontSize: "1rem", fontWeight: 600 }}>Pro Member</h4>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => router.push("/billing")}>Manage</button>
              </div>

              <div className="sub-progress-meters">
                <div className="sub-meter-row" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "4px" }}>
                  <span>Character Credits Remaining</span>
                  <span style={{ color: "var(--color-text)", fontWeight: 600 }}>54,790 / 100,000</span>
                </div>
                <div className="progress-bar-track" style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px" }}>
                  <div className="progress-bar-fill fill-primary" style={{ height: "100%", width: "54.7%", background: "var(--color-primary)", borderRadius: "3px" }} />
                </div>
              </div>
            </div>
          </div>

          {/* AI Usage telemetry */}
          <div className="glass-panel profile-usage-widget" style={{ padding: "24px" }}>
            <h3 className="widget-title" style={{ display: "flex", gap: "6px", alignItems: "center", fontSize: "0.95rem", fontWeight: 600, marginBottom: "16px" }}>
              <Activity size={14} style={{ color: "var(--color-primary)" }} /> AI Engine Metrics
            </h3>
            
            <div className="usage-stats-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="usage-stat-card" style={{ padding: "16px", background: "rgba(255,255,255,0.01)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.03)", textAlign: "center" }}>
                <span className="stat-num" style={{ fontSize: "1.4rem", fontWeight: 700, display: "block" }}>24</span>
                <span className="stat-label" style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Voices Cloned</span>
              </div>
              <div className="usage-stat-card" style={{ padding: "16px", background: "rgba(255,255,255,0.01)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.03)", textAlign: "center" }}>
                <span className="stat-num" style={{ fontSize: "1.4rem", fontWeight: 700, display: "block" }}>45.2K</span>
                <span className="stat-label" style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Chars Used</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column Forms */}
        <div className="profile-right-column" style={{ flex: 1.8 }}>
          
          <div className="glass-panel edit-profile-forms" style={{ padding: "24px" }}>
            <div className="tab-options-bar" style={{ display: "flex", gap: "12px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "12px", marginBottom: "20px" }}>
              <button className={`profile-tab-btn ${activeTab === "edit-profile" ? "active" : ""}`} onClick={() => setActiveTab("edit-profile")}>Edit Profile</button>
              <button className={`profile-tab-btn ${activeTab === "security" ? "active" : ""}`} onClick={() => setActiveTab("security")}>Password & 2FA</button>
              <button className={`profile-tab-btn ${activeTab === "preferences" ? "active" : ""}`} onClick={() => setActiveTab("preferences")}>Preferences</button>
            </div>

            {/* TAB CONTENT: EDIT PROFILE */}
            {activeTab === "edit-profile" && (
              <form id="formEditProfile" className="profile-inputs-form" onSubmit={handleEditProfileSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="form-row-split" style={{ display: "flex", gap: "16px" }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="inputFullName">Full Name</label>
                    <input type="text" id="inputFullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="inputUsername">Username</label>
                    <input type="text" id="inputUsername" value={username} onChange={(e) => setUsername(e.target.value)} required />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="inputEmail">Email Address</label>
                  <input type="email" id="inputEmail" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label htmlFor="inputBio">Bio Description</label>
                  <textarea id="inputBio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
                </div>

                <div className="form-row-split" style={{ display: "flex", gap: "16px" }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="inputCountry">Country</label>
                    <input type="text" id="inputCountry" value={country} onChange={(e) => setCountry(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="inputTimezone">Time Zone</label>
                    <input type="text" id="inputTimezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-glow-hover" style={{ marginTop: "10px", width: "max-content" }}>Save Changes</button>
              </form>
            )}

            {/* TAB CONTENT: PASSWORD & SECURITY */}
            {activeTab === "security" && (
              <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="form-group">
                  <label htmlFor="oldPass">Old Password</label>
                  <input type="password" id="oldPass" placeholder="••••••••" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
                </div>
                <div className="form-row-split" style={{ display: "flex", gap: "16px" }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="newPass">New Password</label>
                    <input type="password" id="newPass" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="confirmPass">Confirm Password</label>
                    <input type="password" id="confirmPass" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "10px 0", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "16px" }}>
                  <Shield size={16} style={{ color: "var(--color-primary)" }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, display: "block" }}>Two-Factor Authentication</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Secure access triggers with mobile pings.</span>
                  </div>
                  <label className="pricing-switch">
                    <input type="checkbox" checked={is2FAEnabled} onChange={(e) => { setIs2FAEnabled(e.target.checked); showToast(`2FA ${e.target.checked ? "enabled" : "disabled"}.`); }} />
                    <span className="pricing-slider" />
                  </label>
                </div>

                <button type="submit" className="btn btn-primary btn-glow-hover" style={{ width: "max-content" }}>Update Password</button>
              </form>
            )}

            {/* TAB CONTENT: PREFERENCES */}
            {activeTab === "preferences" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="form-group">
                  <label>Default Appearance Theme</label>
                  <div className="custom-select">
                    <select value={themeMode} onChange={(e) => { setThemeMode(e.target.value); showToast(`Theme updated to ${e.target.value}.`); }}>
                      <option value="dark">Dark Mode (Default)</option>
                      <option value="light">Light Mode</option>
                      <option value="system">Follow System settings</option>
                    </select>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "16px" }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "12px" }}>Email Notifications</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Marketing Campaigns and Promos</span>
                      <label className="pricing-switch">
                        <input type="checkbox" checked={notifyMarketing} onChange={(e) => setNotifyMarketing(e.target.checked)} />
                        <span className="pricing-slider" />
                      </label>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Weekly Product Updates newsletters</span>
                      <label className="pricing-switch">
                        <input type="checkbox" checked={notifyUpdates} onChange={(e) => setNotifyUpdates(e.target.checked)} />
                        <span className="pricing-slider" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Connected accounts */}
          <div className="glass-panel edit-profile-forms" style={{ padding: "24px", marginTop: "24px" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "16px" }}>Connected Dev Accounts</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Google Integrations</span>
                <button className={`btn ${connections.google ? "btn-secondary" : "btn-primary"} btn-sm`} onClick={() => handleToggleConnection("google")}>
                  {connections.google ? "Disconnect" : "Connect"}
                </button>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>GitHub Developer Sync</span>
                <button className={`btn ${connections.github ? "btn-secondary" : "btn-primary"} btn-sm`} onClick={() => handleToggleConnection("github")}>
                  {connections.github ? "Disconnect" : "Connect"}
                </button>
              </div>
            </div>
          </div>

          {/* Active Sessions list */}
          <div className="glass-panel edit-profile-forms" style={{ padding: "24px", marginTop: "24px" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "16px" }}>Active Logged Sessions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {sessions.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.8rem", borderBottom: "1px solid rgba(255,255,255,0.03)", paddingBottom: "8px" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <Icon size={14} style={{ color: "var(--color-primary)" }} />
                      <div>
                        <span style={{ fontWeight: 600, display: "block" }}>{s.device} • {s.location}</span>
                        <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>{s.browser}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "0.75rem", color: s.status === "Active Now" ? "var(--color-success)" : "var(--color-text-muted)" }}>{s.status}</span>
                      {s.status !== "Active Now" && (
                        <button className="btn-text-link color-red-text" onClick={() => handleTerminateSession(s.id)}>Logout</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Toast alert */}
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
