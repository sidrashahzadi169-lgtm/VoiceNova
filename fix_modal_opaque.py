import re

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

find_overlay = '''          <div 
            onClick={(e) => e.target === e.currentTarget && setCheckoutModalOpen(false)}
            style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, padding: "16px", boxSizing: "border-box" }}
          >
            <div className="glass-panel" style={{ width: "100%", maxWidth: "450px", maxHeight: "90vh", overflowY: "auto", padding: "24px", borderRadius: "16px", position: "relative", background: "var(--color-bg-card)", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>'''

replace_overlay = '''          <div 
            onClick={(e) => e.target === e.currentTarget && setCheckoutModalOpen(false)}
            style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(3, 7, 18, 0.85)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, padding: "16px", boxSizing: "border-box" }}
          >
            <div style={{ width: "100%", maxWidth: "440px", maxHeight: "88vh", overflowY: "auto", padding: "24px", borderRadius: "16px", position: "relative", background: "#0f172a", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.9)" }}>'''

content = content.replace(find_overlay, replace_overlay)

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Checkout Modal background to 100% SOLID opaque dark navy")
