"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email token...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing or invalid.");
      return;
    }

    const performVerification = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed. Token may be expired.");
        }
      } catch {
        setStatus("error");
        setMessage("Connection error. Could not reach server.");
      }
    };

    // Slight delay for animated realism
    const timer = setTimeout(performVerification, 1500);
    return () => clearTimeout(timer);
  }, [token]);

  return (
    <div className="glass-panel auth-card" style={{ maxWidth: "420px", margin: "0 auto", padding: "40px 32px", textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
        {status === "loading" && (
          <div style={{ position: "relative", width: "64px", height: "64px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Loader2 size={48} className="spin" style={{ color: "var(--color-primary)" }} />
          </div>
        )}
        {status === "success" && (
          <CheckCircle size={64} style={{ color: "var(--color-success)" }} />
        )}
        {status === "error" && (
          <XCircle size={64} style={{ color: "var(--color-error)" }} />
        )}
      </div>

      <h3 className="modal-title" style={{ fontSize: "1.5rem", marginBottom: "12px" }}>
        {status === "loading" && "Confirming Email"}
        {status === "success" && "Verification Complete"}
        {status === "error" && "Verification Failed"}
      </h3>

      <p className="modal-subtitle" style={{ fontSize: "0.88rem", lineHeight: 1.5, color: "var(--color-text-secondary)", marginBottom: "32px" }}>
        {message}
      </p>

      {status === "success" && (
        <button
          onClick={() => router.push("/login")}
          className="btn btn-primary btn-full btn-glow-hover"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
        >
          Proceed to Login <ArrowRight size={16} />
        </button>
      )}

      {status === "error" && (
        <Link href="/signup" className="btn btn-outline btn-full">
          Back to Registration
        </Link>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="auth-body" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", position: "relative" }}>
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />

      <Suspense fallback={
        <div className="glass-panel auth-card" style={{ maxWidth: "420px", margin: "0 auto", padding: "40px 32px", textAlign: "center" }}>
          <Loader2 size={48} className="spin" style={{ color: "var(--color-primary)", margin: "0 auto 24px" }} />
          <h3 className="modal-title">Loading Page</h3>
          <p className="modal-subtitle">Initializing verification portal...</p>
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
