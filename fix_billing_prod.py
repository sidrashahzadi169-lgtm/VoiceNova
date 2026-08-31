import re

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace processCheckout logic
logic_find = '''  const processCheckout = async () => {
    if (paymentMethod === "international") {
      showToast("Stripe/PayPal API keys are missing in Vercel. Only manual payments are currently processed.", "error");
      return;
    }
    
    if ((paymentMethod === "easypaisa" || paymentMethod === "zindagi") && tid.length < 5) {
      showToast("Please enter a valid Transaction ID (TID).", "error");
      return;
    }

    showToast("Verifying payment and upgrading to " + selectedPlan + "...");
    try {
      const res = await fetch("/api/payment/mock-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan, paymentMethod, tid }),
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
  };'''

logic_repl = '''  const processCheckout = async () => {
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

content = content.replace(logic_find, logic_repl)

# Replace checkout modal instructions with standard button
modal_find = '''              {(paymentMethod === "easypaisa" || paymentMethod === "zindagi") && (
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
              )}'''
content = content.replace(modal_find, '')

btn_find = '''{(paymentMethod === "easypaisa" || paymentMethod === "zindagi") ? "Verify & Upgrade" : "Proceed to Payment"}'''
btn_repl = '''"Proceed to Secure Checkout"'''
content = content.replace(btn_find, btn_repl)

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Frontend Billing for production API architecture")
