import re

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace processCheckout logic
logic_find = '''  const processCheckout = async () => {
    if (paymentMethod === "paypal") {
      showToast("PayPal API keys are missing. Use Credit Card or Easypaisa.", "error");
      return;
    }
    
    if (paymentMethod === "easypaisa" && tid.length < 5) {
      showToast("Please enter a valid Easypaisa Transaction ID (TID).", "error");
      return;
    }'''

logic_repl = '''  const processCheckout = async () => {
    if (paymentMethod === "international") {
      showToast("Stripe/PayPal API keys are missing in Vercel. Only manual payments are currently processed.", "error");
      return;
    }
    
    if ((paymentMethod === "easypaisa" || paymentMethod === "zindagi") && tid.length < 5) {
      showToast("Please enter a valid Transaction ID (TID).", "error");
      return;
    }'''
content = content.replace(logic_find, logic_repl)

# Replace the checkout modal UI
modal_find_start = content.find('<div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>')
modal_find_end = content.find('onClick={processCheckout}', modal_find_start)

if modal_find_start != -1 and modal_find_end != -1:
    old_modal = content[modal_find_start:modal_find_end]
    new_modal = '''<div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
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
                '''
    content = content[:modal_find_start] + new_modal + content[modal_find_end:]
else:
    print("Could not find modal section.")

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Billing UI updated")
