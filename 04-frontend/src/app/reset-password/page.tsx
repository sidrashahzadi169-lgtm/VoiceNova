"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Password strength states
  const [pwStrengthWidth, setPwStrengthWidth] = useState("0%");
  const [pwStrengthColor, setPwStrengthColor] = useState("transparent");
  const [pwStrengthLabel, setPwStrengthLabel] = useState("");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      showToast("Reset token is missing from URL", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (res.ok) {
        showToast("Password updated successfully!", "success");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        showToast(data.error || "Password reset failed", "error");
      }
    } catch {
      showToast("Server connection error", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card-wrapper" style={{ maxWidth: "440px", width: "100%", margin: "0 auto" }}>
      <Link href="/login" className="auth-back-link" style={{ marginBottom: "20px", display: "inline-flex", alignItems: "center" }}>
        <ArrowLeft size={14} style={{ marginRight: "6px" }} /> Back to Login
      </Link>

      <div className="auth-card-glow-wrapper">
        <div className="card-glow-element card-glow-primary"></div>
        <div className="card-glow-element card-glow-secondary"></div>

        <div className="glass-panel auth-card" style={{ padding: "40px 32px" }}>
          <h3 className="modal-title">Reset Password</h3>
          <p className="modal-subtitle">Choose a strong new password for your account</p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="form-group">
              <label htmlFor="resetPassword">New Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                <input
                  type="password"
                  id="resetPassword"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingLeft: "40px" }}
                />
              </div>

              {/* Password strength meter */}
              {password && (
                <div className="pw-strength-wrapper" style={{ marginTop: "8px" }}>
                  <div className="pw-strength-bar-bg" style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                    <div
                      className="pw-strength-bar-fill"
                      style={{
                        height: "100%",
                        width: pwStrengthWidth,
                        backgroundColor: pwStrengthColor,
                        transition: "width 0.3s ease, background-color 0.3s ease",
                      }}
                    ></div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "0.68rem" }}>
                    <span style={{ color: "var(--color-text-muted)" }}>Complexity Strength:</span>
                    <span style={{ fontWeight: 600, color: pwStrengthColor }}>{pwStrengthLabel}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmResetPassword">Confirm Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                <input
                  type="password"
                  id="confirmResetPassword"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{ paddingLeft: "40px" }}
                />
              </div>
            </div>

            <button type="submit" className={`btn btn-primary btn-full btn-glow-hover ${isLoading ? "btn-loading" : ""}`} disabled={isLoading} style={{ marginTop: "8px" }}>
              {isLoading ? "Saving password..." : "Save Password"}
            </button>
          </form>
        </div>
      </div>

      {/* Toast notifications */}
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

export default function ResetPasswordPage() {
  return (
    <div className="auth-body" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", position: "relative" }}>
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />

      <Suspense fallback={
        <div className="glass-panel auth-card" style={{ maxWidth: "440px", margin: "0 auto", padding: "40px 32px", textAlign: "center" }}>
          <Loader2 size={48} className="spin" style={{ color: "var(--color-primary)", margin: "0 auto 24px" }} />
          <h3 className="modal-title">Loading Page</h3>
          <p className="modal-subtitle">Initializing recovery portal...</p>
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
