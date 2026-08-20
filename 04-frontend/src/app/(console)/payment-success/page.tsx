"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, ArrowRight } from "lucide-react";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    setSessionId(searchParams.get("session_id"));
  }, [searchParams]);

  return (
    <div className="dash-workspace" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", padding: "40px" }}>
      <div className="glass-panel" style={{ textAlign: "center", padding: "60px 40px", maxWidth: "500px" }}>
        <CheckCircle size={64} style={{ color: "var(--color-success)", margin: "0 auto 24px" }} />
        <h2 style={{ fontSize: "2rem", marginBottom: "16px", color: "var(--color-text)" }}>Payment Successful!</h2>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "32px", lineHeight: "1.6" }}>
          Thank you for subscribing. Your plan has been successfully upgraded and your new character limits are now active.
          <br /><br />
          <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>Order ID: {sessionId || "processing..."}</span>
        </p>
        <button className="btn btn-primary btn-glow-hover" onClick={() => router.push("/projects")} style={{ width: "100%", padding: "14px" }}>
          Go to Dashboard <ArrowRight size={16} style={{ marginLeft: "8px" }} />
        </button>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
