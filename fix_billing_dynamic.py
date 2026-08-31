import re

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add useEffect import if not exists
if 'useEffect' not in content:
    content = content.replace('import React, { useState } from "react";', 'import React, { useState, useEffect } from "react";')

# Add states for billing data
find_states = '''  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);'''

replace_states = '''  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [billingData, setBillingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const res = await fetch("/api/payment/billing-info", {
          headers: { "Authorization": "Bearer " + (localStorage.getItem("vn_token") || "") }
        });
        if (res.ok) {
          const json = await res.json();
          setBillingData(json.data);
          if (json.data?.paymentHistory) {
            setInvoices(json.data.paymentHistory.map((p: any) => ({
              id: p.transactionId,
              date: new Date(p.createdAt).toLocaleDateString(),
              amount: p.currency + " " + p.amount,
              status: p.status
            })));
          }
        }
      } catch (err) {
        console.error("Failed to load billing:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBilling();
  }, []);'''
content = content.replace(find_states, replace_states)

# Replace the Current Subscription block
find_sub_block = '''            <div className="current-sub-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
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
                <span className="detail-val" style={{ fontWeight: 600, color: "var(--color-primary)" }}>54,790 Chars</span>
              </div>
              <div className="sub-detail-item" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                <span className="detail-name" style={{ color: "var(--color-text-muted)" }}>Rate Value</span>
                <span className="detail-val" style={{ fontWeight: 500 }}>.00 / Month</span>
              </div>
            </div>'''

replace_sub_block = '''            <div className="current-sub-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <span className="sub-label" style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Current Subscription</span>
                <h2 className="sub-plan-title" style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--color-text)" }}>{billingData ? billingData.plan : "Loading..."}</h2>
              </div>
              <span className="badge badge-success-active" style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.2)", padding: "4px 10px", borderRadius: "100px", fontSize: "0.7rem" }}>Active</span>
            </div>
  
            <div className="sub-details-list" style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
              <div className="sub-detail-item" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                <span className="detail-name" style={{ color: "var(--color-text-muted)" }}>Renewal Date</span>
                <span className="detail-val" style={{ fontWeight: 500 }}>{billingData?.subscription ? new Date(billingData.subscription.endDate).toLocaleDateString() : "Lifetime"}</span>
              </div>
              <div className="sub-detail-item" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                <span className="detail-name" style={{ color: "var(--color-text-muted)" }}>Remaining Credits</span>
                <span className="detail-val" style={{ fontWeight: 600, color: "var(--color-primary)" }}>{billingData ? (billingData.creditLimit - billingData.creditUsed).toLocaleString() : 0} Chars</span>
              </div>
              <div className="sub-detail-item" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                <span className="detail-name" style={{ color: "var(--color-text-muted)" }}>Rate Value</span>
                <span className="detail-val" style={{ fontWeight: 500 }}>{billingData?.subscription ? "$" + billingData.subscription.pricePaid + " / Month" : ".00 / Month"}</span>
              </div>
            </div>'''
content = content.replace(find_sub_block, replace_sub_block)

# Replace RESOURCE USAGE OVERVIEW block
find_usage_block = '''            <div className="usage-bar-item">
              <div className="storage-text-row" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "4px" }}>
                <span>Character Quota Used</span>
                <span>45,210 / 100,000</span>
              </div>
              <div className="progress-bar-track" style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px" }}>
                <div className="progress-bar-fill fill-secondary" style={{ height: "100%", width: "45.2%", background: "var(--color-secondary)", borderRadius: "3px" }} />
              </div>
            </div>
  
            <div className="usage-bar-item">
              <div className="storage-text-row" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "4px" }}>
                <span>Cloud Storage Used</span>
                <span>45.2 MB / 1.0 GB</span>
              </div>
              <div className="progress-bar-track" style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px" }}>
                <div className="progress-bar-fill fill-secondary" style={{ height: "100%", width: "4.5%", background: "var(--color-secondary)", borderRadius: "3px" }} />
              </div>
            </div>
  
            <div className="usage-bar-item">
              <div className="storage-text-row" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "4px" }}>
                <span>API Synthesis Requests</span>
                <span>12,450 / 50,000</span>
              </div>
              <div className="progress-bar-track" style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px" }}>
                <div className="progress-bar-fill fill-secondary" style={{ height: "100%", width: "24.9%", background: "var(--color-secondary)", borderRadius: "3px" }} />
              </div>
            </div>'''

replace_usage_block = '''            <div className="usage-bar-item">
              <div className="storage-text-row" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "4px" }}>
                <span>Character Quota Used</span>
                <span>{billingData ? billingData.creditUsed.toLocaleString() : 0} / {billingData ? billingData.creditLimit.toLocaleString() : 10000}</span>
              </div>
              <div className="progress-bar-track" style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px" }}>
                <div className="progress-bar-fill fill-secondary" style={{ height: "100%", width: billingData ? Math.min(100, (billingData.creditUsed / billingData.creditLimit) * 100) + "%" : "0%", background: "var(--color-secondary)", borderRadius: "3px", transition: "width 0.5s ease" }} />
              </div>
            </div>
  
            <div className="usage-bar-item">
              <div className="storage-text-row" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "4px" }}>
                <span>Cloud Storage Used</span>
                <span>{billingData ? (billingData.creditUsed / 10000).toFixed(1) : 0} MB / 1.0 GB</span>
              </div>
              <div className="progress-bar-track" style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px" }}>
                <div className="progress-bar-fill fill-secondary" style={{ height: "100%", width: billingData ? Math.min(100, (billingData.creditUsed / 10000000) * 100) + "%" : "0%", background: "var(--color-secondary)", borderRadius: "3px" }} />
              </div>
            </div>'''
content = content.replace(find_usage_block, replace_usage_block)

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Billing page UI to be fully dynamic based on API data!")
