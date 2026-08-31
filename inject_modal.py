import re

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'r') as f:
    content = f.read()

# Add states for Modal
state_code = '''const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("easypaisa");
  const [tid, setTid] = useState("");'''

content = re.sub(r'const \[toast, setToast\] = useState<\{ message: string; type: "success" \| "error" \} \| null>\(null\);', state_code, content)

# Change handleUpgradeClick to open modal
new_handle_upgrade = '''const handleUpgradeClick = async (planName: string) => {
    setSelectedPlan(planName);
    setCheckoutModalOpen(true);
  };
  
  const processCheckout = async () => {
    if (paymentMethod === "stripe" || paymentMethod === "paypal") {
      showToast(\ API keys are missing in Vercel Environment Variables. Only Easypaisa is available in manual mode., "error");
      return;
    }
    
    if (paymentMethod === "easypaisa" && tid.length < 5) {
      showToast("Please enter a valid Easypaisa Transaction ID (TID).", "error");
      return;
    }

    showToast(Verifying payment and upgrading to \...);
    try {
      const res = await fetch("/api/payment/mock-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan }),
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

content = re.sub(r'const handleUpgradeClick = async \(planName: string\) => \{.*?  \};', new_handle_upgrade, content, flags=re.DOTALL)

# Add Modal JSX right before the last closing </div> of the component (before } export default function Billing)
modal_jsx = '''
      {checkoutModalOpen && (
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
              <label style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", cursor: "pointer", background: paymentMethod === "stripe" ? "rgba(108, 99, 255, 0.1)" : "transparent" }}>
                <input type="radio" name="payment" checked={paymentMethod === "stripe"} onChange={() => setPaymentMethod("stripe")} />
                <span style={{ fontWeight: 600 }}>Credit Card (Stripe)</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", cursor: "pointer", background: paymentMethod === "paypal" ? "rgba(0, 194, 255, 0.1)" : "transparent" }}>
                <input type="radio" name="payment" checked={paymentMethod === "paypal"} onChange={() => setPaymentMethod("paypal")} />
                <span style={{ fontWeight: 600 }}>PayPal</span>
              </label>
            </div>

            {paymentMethod === "easypaisa" && (
              <div style={{ background: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "8px", marginBottom: "24px", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                <p style={{ marginBottom: "12px" }}>1. Send the subscription amount via Easypaisa to:</p>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><span>Account:</span> <strong style={{ color: "var(--color-text)" }}>Sidra Shahzadi</strong></div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}><span>Number:</span> <strong style={{ color: "var(--color-text)" }}>+92 370-9718035</strong></div>
                
                <p style={{ marginBottom: "8px" }}>2. Enter the 11-digit Transaction ID (TID) below:</p>
                <input 
                  type="text" 
                  placeholder="e.g. 12345678901" 
                  value={tid}
                  onChange={(e) => setTid(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.5)", color: "white" }}
                />
              </div>
            )}

            <button 
              className="btn btn-primary btn-full btn-glow-hover" 
              onClick={processCheckout}
            >
              {paymentMethod === "easypaisa" ? "Verify & Upgrade" : "Proceed to Payment"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}'''

content = re.sub(r'    </div>\s*\);\s*\}', modal_jsx, content)

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'w') as f:
    f.write(content)

print("Done modal injection")
