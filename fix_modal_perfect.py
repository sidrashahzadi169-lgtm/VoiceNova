import re

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

modal_start = content.find('{checkoutModalOpen && (')
if modal_start != -1:
    new_modal = '''{checkoutModalOpen && (
        <div 
          onClick={(e) => e.target === e.currentTarget && setCheckoutModalOpen(false)}
          style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, padding: "16px", boxSizing: "border-box" }}
        >
          <div className="glass-panel" style={{ width: "100%", maxWidth: "450px", maxHeight: "90vh", overflowY: "auto", padding: "24px", borderRadius: "16px", position: "relative", background: "var(--color-bg-card)", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
            <button 
              onClick={() => setCheckoutModalOpen(false)} 
              style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", cursor: "pointer", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", zIndex: 10 }}
            >
              ?
            </button>
            
            <h2 style={{ fontSize: "1.3rem", color: "var(--color-primary)", marginBottom: "4px", fontWeight: 700 }}>Checkout Plan</h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginBottom: "20px" }}>Upgrading subscription to: <strong style={{ color: "#fff" }}>{selectedPlan}</strong></p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", cursor: "pointer", background: paymentMethod === "easypaisa" ? "rgba(16, 185, 129, 0.15)" : "rgba(255,255,255,0.02)" }}>
                <input type="radio" name="payment" checked={paymentMethod === "easypaisa"} onChange={() => setPaymentMethod("easypaisa")} />
                <span style={{ fontWeight: 600, color: "#10b981", fontSize: "0.9rem" }}>Easypaisa Mobile</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", cursor: "pointer", background: paymentMethod === "zindagi" ? "rgba(245, 158, 11, 0.15)" : "rgba(255,255,255,0.02)" }}>
                <input type="radio" name="payment" checked={paymentMethod === "zindagi"} onChange={() => setPaymentMethod("zindagi")} />
                <span style={{ fontWeight: 600, color: "#f59e0b", fontSize: "0.9rem" }}>Bank Card (Zindagi by JS Bank)</span>
              </label>
              
              <label style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", cursor: "pointer", background: paymentMethod === "international" ? "rgba(108, 99, 255, 0.15)" : "rgba(255,255,255,0.02)" }}>
                <input type="radio" name="payment" checked={paymentMethod === "international"} onChange={() => setPaymentMethod("international")} />
                <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#fff" }}>Credit Card (International)</span>
              </label>
            </div>

            {(paymentMethod === "easypaisa" || paymentMethod === "zindagi") && (
              <div style={{ background: "rgba(0,0,0,0.3)", padding: "16px", borderRadius: "10px", marginBottom: "20px", fontSize: "0.85rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                <p style={{ marginBottom: "10px", color: "#fff", fontWeight: 600 }}>1. Transfer payment to account:</p>
                
                {paymentMethod === "easypaisa" && (
                  <div style={{ background: "rgba(16, 185, 129, 0.08)", padding: "10px", borderRadius: "6px", marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><span style={{ color: "var(--color-text-muted)" }}>Title:</span> <strong style={{ color: "#fff" }}>Awais Akhtar</strong></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--color-text-muted)" }}>Easypaisa:</span> <strong style={{ color: "#10b981", fontSize: "0.95rem" }}>03450501272</strong></div>
                  </div>
                )}

                {paymentMethod === "zindagi" && (
                  <div style={{ background: "rgba(245, 158, 11, 0.08)", padding: "10px", borderRadius: "6px", marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><span style={{ color: "var(--color-text-muted)" }}>Bank:</span> <strong style={{ color: "#fff" }}>Zindagi by JS Bank</strong></div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><span style={{ color: "var(--color-text-muted)" }}>Title:</span> <strong style={{ color: "#fff" }}>Awais Akhtar</strong></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--color-text-muted)" }}>Account/Card:</span> <strong style={{ color: "#f59e0b", fontSize: "0.95rem" }}>4934640010350607</strong></div>
                  </div>
                )}
                
                <p style={{ marginBottom: "8px", color: "#fff", fontWeight: 600 }}>2. Enter Transaction ID (TRX/TID):</p>
                <input 
                  type="text" 
                  placeholder="e.g. 28492019482" 
                  value={tid}
                  onChange={(e) => setTid(e.target.value)}
                  style={{ width: "100%", padding: "12px", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", color: "#fff", outline: "none", fontSize: "0.9rem", boxSizing: "border-box" }}
                />
              </div>
            )}

            <div style={{ marginTop: "10px" }}>
              <button 
                className="btn btn-primary btn-full btn-glow-hover" 
                onClick={processCheckout}
                style={{ width: "100%", padding: "12px", fontWeight: 600 }}
              >
                {(paymentMethod === "easypaisa" || paymentMethod === "zindagi") ? "Verify & Upgrade" : "Proceed to Secure Checkout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}'''
    content = content[:modal_start] + new_modal
    with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Perfectly fixed checkout modal structure!")
else:
    print("Modal start tag not found!")
