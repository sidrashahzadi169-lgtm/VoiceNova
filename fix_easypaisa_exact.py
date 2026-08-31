import re

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

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

replace_easypaisa = '''            <div className="payment-card-option glass-panel" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", border: "1px solid #10b981" }}>
                <div className="pay-option-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#10b981" }}>Easypaisa Mobile</span>
                  <span className="badge badge-success-active" style={{ fontSize: "0.6rem" }}>Verified</span>
                </div>
                <div className="pay-details" style={{ display: "flex", flexDirection: "column", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                  <span style={{ color: "var(--color-text)" }}>Awais Akhtar</span>
                  <span>03450501272</span>
                </div>
              </div>'''

if find_easypaisa in content:
    content = content.replace(find_easypaisa, replace_easypaisa)
    with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Easypaisa replaced!")
else:
    print("Easypaisa block not found! Trying regex.")
    content = re.sub(r'Sidra Shahzadi</span>\s*<span>\+92 370-9718035', r'Awais Akhtar</span>\n                  <span>03450501272', content)
    with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Used regex replacement.")
