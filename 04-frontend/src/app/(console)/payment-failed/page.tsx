"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";

export default function PaymentFailed() {
  const router = useRouter();

  return (
    <div className="dash-workspace" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", padding: "40px" }}>
      <div className="glass-panel" style={{ textAlign: "center", padding: "60px 40px", maxWidth: "500px" }}>
        <XCircle size={64} style={{ color: "var(--color-error)", margin: "0 auto 24px" }} />
        <h2 style={{ fontSize: "2rem", marginBottom: "16px", color: "var(--color-text)" }}>Payment Failed</h2>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "32px", lineHeight: "1.6" }}>
          We couldn't process your payment. This might be due to an expired card, insufficient funds, or a network issue.
          <br /><br />
          Please try again or use a different payment method.
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
          <button className="btn btn-secondary" onClick={() => router.push("/billing")} style={{ padding: "14px", flex: 1 }}>
            <ArrowLeft size={16} style={{ marginRight: "8px" }} /> Back to Billing
          </button>
          <button className="btn btn-primary btn-glow-hover" onClick={() => router.push("/billing")} style={{ padding: "14px", flex: 1 }}>
            <RefreshCw size={16} style={{ marginRight: "8px" }} /> Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
