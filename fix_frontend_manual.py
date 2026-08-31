import re

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace processCheckout function
find_func = '''  const processCheckout = async () => {
    showToast("Initializing secure checkout via " + paymentMethod + "...");
    try {
      const res = await fetch("https://voice-nova-sooty.vercel.app/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + (localStorage.getItem("vn_token") || "") },
        body: JSON.stringify({ planName: selectedPlan, gateway: paymentMethod }),
      });
      const data = await res.json();
      if (data.success && data.data?.paymentUrl) {
        window.location.href = data.data.paymentUrl;
      } else if (res.status === 503 || data.error_code === "MISSING_GATEWAY_CONFIG") {
        setCheckoutModalOpen(false);
        alert("PRODUCTION BILLING SETUP REQUIRED:\\n\\n" + data.message + "\\n\\nPlease add the official API keys to your environment variables to enable live payments.");
      } else {
        showToast(data.message || "Checkout failed", "error");
      }
    } catch (err) {
      showToast("Network error connecting to payment gateway.", "error");
    }
  };'''

replace_func = '''  const processCheckout = async () => {
    if (paymentMethod === "international") {
      showToast("Initializing secure checkout via " + paymentMethod + "...");
    } else {
      if (tid.length < 5) {
        showToast("Please enter a valid Transaction ID (TID).", "error");
        return;
      }
      showToast("Submitting your payment for verification...");
    }

    try {
      const res = await fetch("https://voice-nova-sooty.vercel.app/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + (localStorage.getItem("vn_token") || "") },
        body: JSON.stringify({ planName: selectedPlan, gateway: paymentMethod, tid }),
      });
      const data = await res.json();
      
      if (data.success && data.data?.paymentUrl) {
        window.location.href = data.data.paymentUrl;
      } else if (res.status === 503 || data.error_code === "MISSING_GATEWAY_CONFIG") {
        setCheckoutModalOpen(false);
        alert("PRODUCTION BILLING SETUP REQUIRED:\\n\\n" + data.message + "\\n\\nPlease add the official API keys to your environment variables to enable live payments.");
      } else {
        showToast(data.message || "Checkout failed", "error");
      }
    } catch (err) {
      showToast("Network error connecting to payment gateway.", "error");
    }
  };'''

content = content.replace(find_func, replace_func)

# Insert the manual HTML UI block back
find_html = '''              </div>

              <div style={{ marginTop: "auto" }}>
                <button 
                  className="btn btn-primary btn-full btn-glow-hover" 
                  onClick={processCheckout}
                >
                  "Proceed to Secure Checkout"
                </button>
              </div>'''

replace_html = '''              </div>

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
                  {(paymentMethod === "easypaisa" || paymentMethod === "zindagi") ? "Verify & Upgrade" : "Proceed to Secure Checkout"}
                </button>
              </div>'''

content = content.replace(find_html, replace_html)

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated frontend UI to restore manual payments")
