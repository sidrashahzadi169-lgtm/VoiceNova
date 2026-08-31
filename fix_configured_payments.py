import re

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace PayPal Account with Zindagi by JS Bank
find_paypal = '''            <div className="payment-card-option glass-panel" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="pay-option-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>PayPal Account</span>
              </div>
              <div className="pay-details" style={{ display: "flex", flexDirection: "column", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                <span>sidra.nova@paypal.com</span>
                <span>Linked Sync</span>
                </div>            </div>'''

replace_zindagi = '''            <div className="payment-card-option glass-panel" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", border: "1px solid #f59e0b" }}>
              <div className="pay-option-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#f59e0b" }}>Zindagi by JS Bank</span>
                <span className="badge badge-success-active" style={{ fontSize: "0.6rem" }}>Verified</span>
              </div>
              <div className="pay-details" style={{ display: "flex", flexDirection: "column", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                <span style={{ color: "var(--color-text)" }}>Awais Akhtar</span>
                <span>4934640010350607</span>
              </div>
            </div>'''

content = content.replace(find_paypal, replace_zindagi)

# Replace Easypaisa details
find_easypaisa = '''              <div className="payment-card-option glass-panel" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", border: "1px solid #10b981" }}>
                <div className="pay-option-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#10b981" }}>Easypaisa Mobile</span>
                  <span className="badge badge-success-active" style={{ fontSize: "0.6rem" }}>Verified</span>
                </div>
                <div className="pay-details" style={{ display: "flex", flexDirection: "column", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                  <span style={{ color: "var(--color-text)" }}>Sidra Shahzadi</span>
                  <span>+92 370-9718035</span>
                </div>
              </div>'''

replace_easypaisa_new = '''            <div className="payment-card-option glass-panel" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", border: "1px solid #10b981" }}>
              <div className="pay-option-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#10b981" }}>Easypaisa Mobile</span>
                <span className="badge badge-success-active" style={{ fontSize: "0.6rem" }}>Verified</span>
              </div>
              <div className="pay-details" style={{ display: "flex", flexDirection: "column", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                <span style={{ color: "var(--color-text)" }}>Awais Akhtar</span>
                <span>03450501272</span>
              </div>
            </div>'''

content = content.replace(find_easypaisa, replace_easypaisa_new)

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Configured Payment Methods UI")
