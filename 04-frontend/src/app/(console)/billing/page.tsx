"use client";

import React, { useState } from "react";
import {
  Activity,
  Check,
  X as XIcon,
  CreditCard,
  Lock,
  Smartphone,
  Wallet,
  Download,
  Zap,
} from "lucide-react";

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: "Paid" | "Failed";
}

export default function Billing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: "INV-2026-006", date: "June 15, 2026", amount: "$29.00 USD", status: "Paid" },
    { id: "INV-2026-005", date: "May 15, 2026", amount: "$29.00 USD", status: "Paid" },
    { id: "INV-2026-004", date: "April 15, 2026", amount: "$29.00 USD", status: "Paid" },
  ]);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDownloadInvoice = (invId: string) => {
    showToast(`Downloading receipt for ${invId}...`);
  };

    const handleUpgradeClick = async (planName: string) => {
    
    showToast(`Processing upgrade to ${planName}...`);
    try {
      const res = await fetch("/api/payment/mock-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planName }),
      });
      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        showToast(data.message || "Checkout failed", "error");
        
      }
    } catch (err) {
      showToast("Network error. Try again.", "error");
      
    }
  };

  return (
    <div className="dash-workspace">
      
      {/* Current plan detail row split */}
      <div className="billing-split-row" style={{ display: "flex", gap: "24px", marginBottom: "32px" }}>
        
        {/* Current Plan Card */}
        <div className="glass-panel current-sub-card" style={{ flex: 1, padding: "24px", position: "relative", overflow: "hidden" }}>
          <div className="current-sub-glow" />
          <div className="current-sub-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
            <div>
              <span className="sub-label" style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Current Subscription</span>
              <h2 className="sub-plan-title" style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--color-text)" }}>Pro Plan</h2>
            </div>
            <span className="badge badge-success-active" style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.2)", padding: "4px 10px", borderRadius: "100px", fontSize: "0.7rem" }}>Active</span>
          </div>

          <div className="sub-details-list" style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
            <div className="sub-detail-item" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
              <span className="detail-name" style={{ color: "var(--color-text-muted)" }}>Renewal Date</span>
              <span className="detail-val" style={{ fontWeight: 500 }}>July 15, 2026</span>
            </div>
            <div className="sub-detail-item" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
              <span className="detail-name" style={{ color: "var(--color-text-muted)" }}>Remaining Credits</span>
              <span className="detail-val" style={{ fontWeight: 600, color: "var(--color-secondary)" }}>54,790 Chars</span>
            </div>
            <div className="sub-detail-item" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
              <span className="detail-name" style={{ color: "var(--color-text-muted)" }}>Rate Value</span>
              <span className="detail-val" style={{ fontWeight: 500 }}>$29.00 / Month</span>
            </div>
          </div>

          <button className="btn btn-primary btn-full btn-glow-hover" onClick={() => handleUpgradeClick("Enterprise")}>Upgrade Subscription</button>
        </div>

        {/* Resource Usage Overview */}
        <div className="glass-panel usage-overview-card" style={{ flex: 1.2, padding: "24px" }}>
          <h3 className="widget-title" style={{ display: "flex", gap: "6px", alignItems: "center", fontSize: "1rem", fontWeight: 600, marginBottom: "20px" }}>
            <Activity size={16} style={{ color: "var(--color-secondary)" }} /> Resource Usage Overview
          </h3>

          <div className="usage-bars-list" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="usage-bar-item">
              <div className="storage-text-row" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "4px" }}>
                <span>Character Quota Used</span>
                <span style={{ color: "var(--color-text)", fontWeight: 500 }}>45,210 / 100,000</span>
              </div>
              <div className="progress-bar-track" style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px" }}>
                <div className="progress-bar-fill fill-secondary" style={{ height: "100%", width: "45.2%", background: "var(--color-secondary)", borderRadius: "3px" }} />
              </div>
            </div>

            <div className="usage-bar-item">
              <div className="storage-text-row" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "4px" }}>
                <span>Cloud Storage Used</span>
                <span style={{ color: "var(--color-text)", fontWeight: 500 }}>45.2 MB / 1.0 GB</span>
              </div>
              <div className="progress-bar-track" style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px" }}>
                <div className="progress-bar-fill fill-secondary" style={{ height: "100%", width: "4.5%", background: "var(--color-secondary)", borderRadius: "3px" }} />
              </div>
            </div>

            <div className="usage-bar-item">
              <div className="storage-text-row" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "4px" }}>
                <span>API Synthesis Requests</span>
                <span style={{ color: "var(--color-text)", fontWeight: 500 }}>12,450 / 50,000</span>
              </div>
              <div className="progress-bar-track" style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px" }}>
                <div className="progress-bar-fill fill-secondary" style={{ height: "100%", width: "24.9%", background: "var(--color-secondary)", borderRadius: "3px" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flexible Plan Options pricing grid */}
      <div className="pricing-switcher-wrapper" style={{ textAlign: "center", marginBottom: "32px" }}>
        <h2 className="section-title-alt">Flexible Plan Options</h2>
        <p className="section-subtitle-alt">Choose a scaling tier tailored to your voiceover and cloning volume.</p>
        
        <div className="pricing-switcher" id="pricingCycleToggle" style={{ display: "inline-flex", gap: "6px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", padding: "4px", marginTop: "16px" }}>
          <button className={`switcher-btn ${billingCycle === "monthly" ? "active" : ""}`} onClick={() => setBillingCycle("monthly")}>Monthly Billing</button>
          <button className={`switcher-btn ${billingCycle === "yearly" ? "active" : ""}`} onClick={() => setBillingCycle("yearly")}>Yearly Billing (Save 20%)</button>
        </div>
      </div>

      <div className="billing-pricing-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        
        {/* Free Plan */}
        <div className="pricing-card glass-panel" style={{ padding: "24px" }}>
          <div className="pricing-header" style={{ marginBottom: "20px" }}>
            <h3 className="pricing-plan-name" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Free</h3>
            <div className="pricing-amount" style={{ fontSize: "1.8rem", fontWeight: 700, margin: "8px 0" }}>
              <span className="price-symbol">$</span><span className="price-val">0</span><span className="price-duration" style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>/mo</span>
            </div>
            <span className="pricing-plan-description" style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>For exploring basic synthesizers.</span>
          </div>
          <ul className="pricing-features" style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.8rem", color: "var(--color-text-muted)", listStyle: "none", padding: 0, marginBottom: "24px" }}>
            <li><Check size={12} style={{ color: "var(--color-success)", marginRight: "8px" }} /> 10,000 Chars / Month</li>
            <li><Check size={12} style={{ color: "var(--color-success)", marginRight: "8px" }} /> Standard Voices Access</li>
            <li><XIcon size={12} style={{ color: "var(--color-error)", marginRight: "8px" }} /> Cloned Voices Blocked</li>
          </ul>
          <button className="btn btn-outline btn-full" disabled style={{ opacity: 0.5 }}>Free Tier Active</button>
        </div>

        {/* Starter Plan */}
        <div className="pricing-card glass-panel" style={{ padding: "24px" }}>
          <div className="pricing-header" style={{ marginBottom: "20px" }}>
            <h3 className="pricing-plan-name" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Starter</h3>
            <div className="pricing-amount" style={{ fontSize: "1.8rem", fontWeight: 700, margin: "8px 0" }}>
              <span className="price-symbol">$</span><span className="price-val">{billingCycle === "yearly" ? 7 : 9}</span><span className="price-duration" style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>/mo</span>
            </div>
            <span className="pricing-plan-description" style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>For creators starting script work.</span>
          </div>
          <ul className="pricing-features" style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.8rem", color: "var(--color-text-muted)", listStyle: "none", padding: 0, marginBottom: "24px" }}>
            <li><Check size={12} style={{ color: "var(--color-success)", marginRight: "8px" }} /> 50,000 Chars / Month</li>
            <li><Check size={12} style={{ color: "var(--color-success)", marginRight: "8px" }} /> 1 Custom Voice Clone</li>
            <li><Check size={12} style={{ color: "var(--color-success)", marginRight: "8px" }} /> Basic API Access</li>
          </ul>
          <button className="btn btn-outline btn-full" onClick={() => handleUpgradeClick("Starter")}>Downgrade to Starter</button>
        </div>

        {/* Pro Plan */}
        <div className="pricing-card glass-panel popular-pricing-card" style={{ padding: "24px", position: "relative" }}>
          <div className="pricing-card-glow" />
          <span className="pricing-card-badge" style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(108,99,255,0.1)", color: "var(--color-primary)", border: "1px solid rgba(108,99,255,0.2)", fontSize: "0.6rem", padding: "2px 8px", borderRadius: "100px" }}>Popular</span>
          <div className="pricing-header" style={{ marginBottom: "20px" }}>
            <h3 className="pricing-plan-name" style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--color-primary)" }}>Pro</h3>
            <div className="pricing-amount" style={{ fontSize: "1.8rem", fontWeight: 700, margin: "8px 0" }}>
              <span className="price-symbol">$</span><span className="price-val">{billingCycle === "yearly" ? 23 : 29}</span><span className="price-duration" style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>/mo</span>
            </div>
            <span className="pricing-plan-description" style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>For professional dubbing.</span>
          </div>
          <ul className="pricing-features" style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.8rem", color: "var(--color-text-muted)", listStyle: "none", padding: 0, marginBottom: "24px" }}>
            <li><Check size={12} style={{ color: "var(--color-success)", marginRight: "8px" }} /> 150,000 Chars / Month</li>
            <li><Check size={12} style={{ color: "var(--color-success)", marginRight: "8px" }} /> 5 Custom Voice Clones</li>
            <li><Check size={12} style={{ color: "var(--color-success)", marginRight: "8px" }} /> Pro API Integration</li>
          </ul>
          <button className="btn btn-primary btn-full btn-glow-hover" disabled>Current Active Plan</button>
        </div>
      </div>

      {/* Payment methods */}
      <div className="payment-methods-section glass-panel" style={{ padding: "24px", marginBottom: "32px" }}>
        <h3 className="widget-title" style={{ display: "flex", gap: "6px", alignItems: "center", fontSize: "1rem", fontWeight: 600, marginBottom: "20px" }}>
          <CreditCard size={16} style={{ color: "var(--color-secondary)" }} /> Configured Payment Methods
        </h3>
        
        <div className="payment-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          <div className="payment-card-option glass-panel active" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", border: "1px solid var(--color-primary)" }}>
            <div className="pay-option-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>Stripe Core (Visa)</span>
              <span className="badge badge-success-active" style={{ fontSize: "0.6rem" }}>Default</span>
            </div>
            <div className="pay-details" style={{ display: "flex", flexDirection: "column", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
              <span>•••• •••• •••• 4242</span>
              <span>Expires 12/28</span>
            </div>
          </div>

          <div className="payment-card-option glass-panel" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="pay-option-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>PayPal Account</span>
            </div>
            <div className="pay-details" style={{ display: "flex", flexDirection: "column", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
              <span>sidra.nova@paypal.com</span>
              <span>Linked Sync</span>
              </div>            </div>

            <div className="payment-card-option glass-panel" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", border: "1px solid #10b981" }}>
              <div className="pay-option-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#10b981" }}>Easypaisa Mobile</span>
                <span className="badge badge-success-active" style={{ fontSize: "0.6rem" }}>Verified</span>
              </div>
              <div className="pay-details" style={{ display: "flex", flexDirection: "column", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                <span style={{ color: "var(--color-text)" }}>Sidra Shahzadi</span>
                <span>+92 370-9718035</span>
              </div>
            </div>
          </div>
        </div>

      {/* Invoices table list */}
      <section className="projects-section">
        <h2 className="section-title-alt">Billing History</h2>
        <div className="table-container glass-panel">
          <table className="projects-table">
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td><strong>{inv.id}</strong></td>
                  <td>{inv.date}</td>
                  <td>{inv.amount}</td>
                  <td><span className="status-pill status-pill-success">{inv.status}</span></td>
                  <td>
                    <button className="btn btn-outline btn-sm download-invoice-btn" onClick={() => handleDownloadInvoice(inv.id)}>
                      <Download size={12} style={{ marginRight: "4px" }} /> <span>Invoice</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Upgrade CTA banner */}
      <div className="upgrade-cta-banner glass-panel" style={{ padding: "32px", marginTop: "32px", position: "relative", overflow: "hidden" }}>
        <div className="upgrade-cta-glow" />
        <div className="cta-banner-content" style={{ textAlign: "center", position: "relative", zIndex: 5 }}>
          <h2 className="cta-banner-title" style={{ fontSize: "1.4rem", fontWeight: 700 }}>Unlock Premium AI Voices</h2>
          <p className="cta-banner-desc" style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "10px 0 20px 0" }}>Integrate high speed compute nodes, create unlimited custom voice clones, and synthesize millions of characters. Upgrade to our Enterprise plans now.</p>
          <button className="btn btn-primary btn-glow-hover" onClick={() => showToast("Contacting sales representative...")}><Zap size={12} style={{ marginRight: "6px" }} /> Talk to Enterprise Sales</button>
        </div>
      </div>

      {/* Toast Notification overlay */}
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




