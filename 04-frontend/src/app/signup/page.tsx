"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, ArrowLeft } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Password strength states
  const [pwStrengthWidth, setPwStrengthWidth] = useState("0%");
  const [pwStrengthColor, setPwStrengthColor] = useState("transparent");
  const [pwStrengthLabel, setPwStrengthLabel] = useState("");

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Run password strength checks
  useEffect(() => {
    if (!password) {
      setPwStrengthWidth("0%");
      setPwStrengthColor("transparent");
      setPwStrengthLabel("");
      return;
    }

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) {
      setPwStrengthWidth("33%");
      setPwStrengthColor("var(--color-error)");
      setPwStrengthLabel("Weak");
    } else if (score === 2 || score === 3) {
      setPwStrengthWidth("66%");
      setPwStrengthColor("var(--color-warning)");
      setPwStrengthLabel("Medium");
    } else if (score === 4) {
      setPwStrengthWidth("100%");
      setPwStrengthColor("var(--color-success)");
      setPwStrengthLabel("Strong");
    }
  }, [password]);

  // Canvas visualizer with starfield particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 400;
      canvas.height = canvas.parentElement?.clientHeight || 240;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let phase = 0;
    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      alpha: number;
    }> = [];

    for (let i = 0; i < 20; i++) {
      particles.push({
        x: Math.random() * 400,
        y: Math.random() * 240,
        radius: Math.random() * 1.5 + 0.5,
        vx: Math.random() * 0.2 - 0.1,
        vy: Math.random() * -0.3 - 0.1,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const centerY = h / 2;

      // Draw drifting starfield particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = h;

        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw radial gradient glow
      const gradBg = ctx.createRadialGradient(w / 2, centerY, 10, w / 2, centerY, 100);
      gradBg.addColorStop(0, "rgba(108, 99, 255, 0.08)");
      gradBg.addColorStop(1, "rgba(15, 23, 42, 0)");
      ctx.fillStyle = gradBg;
      ctx.fillRect(0, 0, w, h);

      phase += 0.04;
      const waves = [
        { amp: 26, freq: 0.015, color: "#6C63FF", shadow: "rgba(108, 99, 255, 0.8)", delay: 0 },
        { amp: 16, freq: 0.025, color: "#00C2FF", shadow: "rgba(0, 194, 255, 0.8)", delay: Math.PI },
        { amp: 8, freq: 0.035, color: "#ffffff", shadow: "rgba(255, 255, 255, 0.5)", delay: Math.PI / 2 },
      ];

      waves.forEach((wave) => {
        ctx.save();
        ctx.lineWidth = wave.color === "#ffffff" ? 1.5 : 2.5;
        ctx.strokeStyle = wave.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = wave.shadow;
        ctx.beginPath();
        ctx.moveTo(0, centerY);

        for (let x = 0; x < w; x++) {
          const envelope = Math.sin((x / w) * Math.PI);
          const y = centerY + Math.sin(x * wave.freq + phase + wave.delay) * wave.amp * envelope;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("userFullName", name);
        localStorage.setItem("userEmail", email);
        showToast("Registration successful! Launching verification simulator...", "success");
        
        // Redirect to email verification simulation page
        setTimeout(() => {
          router.push(`/verify-email?token=${data.verificationToken}`);
        }, 1500);
      } else {
        showToast(data.error || "Registration failed", "error");
      }
    } catch {
      showToast("Server connection error. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/oauth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, "success");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        showToast(data.error || "OAuth failed", "error");
      }
    } catch {
      showToast("OAuth connection error", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-body" style={{ minHeight: "100vh", position: "relative" }}>
      
      {/* Background glows */}
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />

      <div className="auth-layout">
        {/* Brand Side */}
        <div className="auth-info-side">
          <div className="auth-info-content">
            <Link href="/" className="logo auth-logo-top">
              <div className="logo-icon">
                <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 20V20C8 13.3726 13.3726 8 20 8V8C26.6274 8 32 13.3726 32 20V20C32 26.6274 26.6274 32 20 32V32C13.3726 32 8 26.6274 8 20Z" stroke="url(#paint0_linear)" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M14 20V20" stroke="url(#paint1_linear)" strokeWidth="4" strokeLinecap="round"/>
                  <path d="M20 13V27" stroke="url(#paint2_linear)" strokeWidth="4" strokeLinecap="round"/>
                  <path d="M26 17V23" stroke="url(#paint3_linear)" strokeWidth="4" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="paint0_linear" x1="8" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#6C63FF"/>
                      <stop offset="1" stopColor="#00C2FF"/>
                    </linearGradient>
                    <linearGradient id="paint1_linear" x1="14" y1="20" x2="14" y2="20" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#6C63FF"/>
                      <stop offset="1" stopColor="#00C2FF"/>
                    </linearGradient>
                    <linearGradient id="paint2_linear" x1="20" y1="13" x2="20" y2="27" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#6C63FF"/>
                      <stop offset="1" stopColor="#00C2FF"/>
                    </linearGradient>
                    <linearGradient id="paint3_linear" x1="26" y1="17" x2="26" y2="23" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#6C63FF"/>
                      <stop offset="1" stopColor="#00C2FF"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="logo-text">VoiceNova</span>
            </Link>

            <h2 className="auth-info-title">Create. Clone. <span className="gradient-text">Speak.</span></h2>
            <p className="auth-info-desc">Access our advanced suite of deep neural synthesizers. Turn blogs into podcasts, translate audio globally, and create distinct voice actors with ease.</p>

            <div className="auth-canvas-container">
              <canvas ref={canvasRef} id="signupWaveformCanvas"></canvas>
              <div className="visualizer-card-header" style={{ position: "absolute", bottom: "20px", left: "20px", zIndex: 10, marginBottom: 0 }}>
                <span className="vis-indicator"></span>
                <span>Neural Pipeline Node Active</span>
              </div>
            </div>
          </div>

          <div className="auth-info-footer">
            <p>&copy; 2026 VoiceNova Inc. Studio Edition v2.1</p>
          </div>
        </div>

        {/* Form Side */}
        <div className="auth-form-side">
          <div className="auth-card-wrapper">
            <Link href="/" className="auth-back-link">
              <ArrowLeft size={14} style={{ marginRight: "6px" }} /> Back to Home
            </Link>

            <div className="auth-card-glow-wrapper">
              <div className="card-glow-element card-glow-primary"></div>
              <div className="card-glow-element card-glow-secondary"></div>

              <div className="glass-panel auth-card">
                <h3 className="modal-title">Create Account</h3>
                <p className="modal-subtitle">Start generating AI voices for free</p>

                <button className="btn btn-outline btn-full btn-google-auth" onClick={() => handleOAuth("google")}>
                  <svg className="google-logo-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Sign up with Google</span>
                </button>

                <div className="auth-separator">
                  <span>or create free account</span>
                </div>

                <form id="pageSignupForm" onSubmit={handleSignup}>
                  <div className="form-group">
                    <label htmlFor="pageSignupName">Full Name</label>
                    <div style={{ position: "relative" }}>
                      <User size={14} className="input-field-icon" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                      <input
                        type="text"
                        id="pageSignupName"
                        placeholder="Alex Morgan"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={{ paddingLeft: "40px" }}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: "12px" }}>
                    <label htmlFor="pageSignupEmail">Email Address</label>
                    <div style={{ position: "relative" }}>
                      <Mail size={14} className="input-field-icon" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                      <input
                        type="email"
                        id="pageSignupEmail"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ paddingLeft: "40px" }}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: "12px" }}>
                    <label htmlFor="pageSignupPassword">Password</label>
                    <div style={{ position: "relative" }}>
                      <Lock size={14} className="input-field-icon" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                      <input
                        type="password"
                        id="pageSignupPassword"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ paddingLeft: "40px" }}
                      />
                    </div>

                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="password-strength-wrapper" id="pwStrengthWrapper" style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                          <span>Password Strength:</span>
                          <span id="pwStrengthText" style={{ color: pwStrengthColor, fontWeight: 600 }}>{pwStrengthLabel}</span>
                        </div>
                        <div style={{ height: "4px", width: "100%", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                          <div id="pwStrengthBar" style={{ height: "100%", width: pwStrengthWidth, background: pwStrengthColor, transition: "width 0.3s ease, background 0.3s ease" }}></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <button type="submit" className={`btn btn-primary btn-full btn-glow-hover ${isLoading ? "btn-loading" : ""}`} id="submitSignupBtn" disabled={isLoading}>
                    {isLoading ? "Registering..." : "Create Account"}
                  </button>
                </form>

                <div className="auth-card-footer">
                  Already have an account? <Link href="/login" className="switch-auth-link">Log In</Link>
                </div>
              </div>
            </div>
          </div>
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
