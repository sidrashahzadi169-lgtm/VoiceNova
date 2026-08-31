import re

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's find everything from checkoutModalOpen && to the end of the file, and replace it entirely to guarantee correctness.
start_idx = content.find('{checkoutModalOpen && (')

if start_idx != -1:
    content = content[:start_idx] + '''{checkoutModalOpen && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
            <div className="glass-panel" style={{ width: "90%", maxWidth: "450px", padding: "30px", borderRadius: "16px", position: "relative" }}>
              <button onClick={() => setCheckoutModalOpen(false)} style={{ position: "absolute", top: "16px", right: "16px", background: "transparent", border: "none", color: "var(--color-text-muted)", cursor: "pointer", fontSize: "1.2rem" }}>?</button>
              
              <h2 style={{ fontSize: "1.4rem", color: "var(--color-primary)", marginBottom: "8px" }}>Checkout</h2>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginBottom: "24px" }}>Complete your upgrade to <strong>{selectedPlan}</strong>.</p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", cursor: "pointer", background: paymentMethod === "easypaisa" ? "rgba(16, 185, 129, 0.1)" : "transparent" }}>
                  <input type="radio" name="payment" checked={paymentMethod === "easypaisa"} onChange={() => setPaymentMethod("easypaisa")} />
                  <span style={{ fontWeight: 600, color: "#10b981" }}>Easypaisa Mobile</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", cursor: "pointer", background: paymentMethod === "zindagi" ? "rgba(245, 158, 11, 0.1)" : "transparent" }}>
                  <input type="radio" name="payment" checked={paymentMethod === "zindagi"} onChange={() => setPaymentMethod("zindagi")} />
                  <span style={{ fontWeight: 600, color: "#f59e0b" }}>Bank Card (Zindagi by JS Bank)</span>
                </label>
                
                <label style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", cursor: "pointer", background: paymentMethod === "international" ? "rgba(108, 99, 255, 0.1)" : "transparent" }}>
                  <input type="radio" name="payment" checked={paymentMethod === "international"} onChange={() => setPaymentMethod("international")} />
                  <span style={{ fontWeight: 600 }}>Credit Card (International)</span>
                </label>
              </div>

              {(paymentMethod === "easypaisa" || paymentMethod === "zindagi") && (
                <div style={{ background: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "8px", marginBottom: "24px", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                  <p style={{ marginBottom: "12px", color: "var(--color-text)" }}>1. Send the subscription amount to:</p>
                  
                  {paymentMethod === "easypaisa" && (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><span>Account Title:</span> <strong style={{ color: "var(--color-text)" }}>Awais Akhtar</strong></div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}><span>Easypaisa Number:</span> <strong style={{ color: "var(--color-text)" }}>03450501272</strong></div>
                    </>
                  )}

                  {paymentMethod === "zindagi" && (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><span>Bank:</span> <strong style={{ color: "var(--color-text)" }}>Zindagi by JS Bank</strong></div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><span>Account Title:</span> <strong style={{ color: "var(--color-text)" }}>Awais Akhtar</strong></div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}><span>Card / Account Number:</span> <strong style={{ color: "var(--color-text)" }}>4934640010350607</strong></div>
                    </>
                  )}
                  
                  <p style={{ marginBottom: "8px" }}>2. Enter the Transaction ID (TID) or Reference No below:</p>
                  <input 
                    type="text" 
                    placeholder="e.g. 12345678901" 
                    value={tid}
                    onChange={(e) => setTid(e.target.value)}
                    style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", outline: "none" }}
                  />
                </div>
              )}

              <div style={{ marginTop: "auto" }}>
                <button 
                  className="btn btn-primary btn-full btn-glow-hover" 
                  onClick={processCheckout}
                >
                  {(paymentMethod === "easypaisa" || paymentMethod === "zindagi") ? "Verify & Upgrade" : "Proceed to Payment"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
'''
    with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed formatting!")
