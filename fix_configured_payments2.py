import re

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace PayPal Account with Zindagi
start_idx = content.find('<span style={{ fontWeight: 600, fontSize: "0.85rem" }}>PayPal Account</span>')
if start_idx != -1:
    block_start = content.rfind('<div className="payment-card-option', 0, start_idx)
    block_end = content.find('</div>            </div>', block_start) + len('</div>            </div>')
    if block_start != -1 and block_end != -1:
        replace_zindagi = '''<div className="payment-card-option glass-panel" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", border: "1px solid #f59e0b" }}>
              <div className="pay-option-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#f59e0b" }}>Zindagi by JS Bank</span>
                <span className="badge badge-success-active" style={{ fontSize: "0.6rem" }}>Verified</span>
              </div>
              <div className="pay-details" style={{ display: "flex", flexDirection: "column", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                <span style={{ color: "var(--color-text)" }}>Awais Akhtar</span>
                <span>4934640010350607</span>
              </div>
            </div>'''
        content = content[:block_start] + replace_zindagi + content[block_end:]

# Replace Easypaisa details
start_idx2 = content.find('<span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#10b981" }}>Easypaisa Mobile</span>')
if start_idx2 != -1:
    block_start2 = content.rfind('<div className="payment-card-option', 0, start_idx2)
    block_end2 = content.find('</div>\n              </div>\n            </div>\n          </div>', block_start2)
    if block_start2 != -1 and block_end2 != -1:
        replace_easypaisa = '''<div className="payment-card-option glass-panel" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", border: "1px solid #10b981" }}>
              <div className="pay-option-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#10b981" }}>Easypaisa Mobile</span>
                <span className="badge badge-success-active" style={{ fontSize: "0.6rem" }}>Verified</span>
              </div>
              <div className="pay-details" style={{ display: "flex", flexDirection: "column", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                <span style={{ color: "var(--color-text)" }}>Awais Akhtar</span>
                <span>03450501272</span>
              </div>
            </div>'''
        content = content[:block_start2] + replace_easypaisa + content[block_end2 + len('</div>\n              </div>'):] # Adjust end carefully

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Configured Payment Methods UI robustly")
