"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AIAssistant from "@/components/AIAssistant";
import Background from "@/components/Background";

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [bannerResent, setBannerResent] = useState(false);

  // Fetch session on load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error("Session loader error:", err);
      }
    };
    checkSession();
  }, []);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        window.location.href = "/login";
      }
    } catch (err) {
      console.error("Logout request error:", err);
    }
  };

  const handleResendVerification = () => {
    setBannerResent(true);
    alert(`A simulation email verification link has been resent to ${user?.email}. Check your inbox!`);
  };

  return (
    <div className="dashboard-body-wrapper" style={{ display: "flex", minHeight: "100vh", position: "relative" }}>
      {/* Waveform Background & Glow Circles */}
      <Background />

      {/* Sidebar Panel */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
        isAdmin={user?.plan === 'admin' || user?.plan === 'root' || user?.email === 'admin@voicenova.ai' || user?.email === 'info@voicenova.ai'}
      />

      {/* Main Console Viewport Wrapper */}
      <div className="dash-main-container">
        {/* Verification Warning Alert banner */}
        {user && !user.verified && (
          <div
            className="verification-banner"
            style={{
              background: "linear-gradient(135deg, rgba(234, 67, 53, 0.16) 0%, rgba(108, 99, 255, 0.16) 100%)",
              backdropFilter: "blur(12px)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
              padding: "10px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.8rem",
              color: "white",
              zIndex: 1000,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "#EA4335" }}></span>
              <span>Your email (<strong>{user.email}</strong>) is not verified. Please check your inbox or resend code.</span>
            </div>
            <button
              onClick={handleResendVerification}
              disabled={bannerResent}
              style={{
                background: bannerResent ? "rgba(255,255,255,0.06)" : "var(--color-primary)",
                border: "none",
                borderRadius: "4px",
                color: bannerResent ? "var(--color-text-muted)" : "white",
                padding: "4px 12px",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: bannerResent ? "default" : "pointer",
                boxShadow: bannerResent ? "none" : "0 0 10px rgba(108,99,255,0.3)",
              }}
            >
              {bannerResent ? "Resent!" : "Resend"}
            </button>
          </div>
        )}

        {/* Top Navbar */}
        <Header
          onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onAssistantToggle={() => setIsAssistantOpen(!isAssistantOpen)}
          user={user}
        />

        {/* Console Page Content Panel */}
        <main className="dash-content-area">{children}</main>
      </div>

      {/* Floating AI chat drawer overlay */}
      <AIAssistant isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
    </div>
  );
}
