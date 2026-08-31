import re

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

find_checkout = '''    const processCheckout = async () => {
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

replace_checkout = '''    const processCheckout = async () => {
      if (paymentMethod === "international") {
        showToast("Initializing secure checkout via " + paymentMethod + "...");
      } else {
        if (!tid || tid.trim().length < 5) {
          showToast("Please enter a valid Transaction ID (TID).", "error");
          return;
        }
        showToast("Submitting your payment for verification...");
      }
  
      try {
        const res = await fetch("/api/payment/checkout", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json", 
            "Authorization": "Bearer " + (localStorage.getItem("userEmail") || "") 
          },
          body: JSON.stringify({ planName: selectedPlan, gateway: paymentMethod, tid }),
        });
        const data = await res.json();
        
        if (data.success) {
          setCheckoutModalOpen(false);
          setTid("");
          showToast(data.message || "Payment submitted successfully!", "success");
        } else {
          showToast(data.message || "Checkout failed. Please try again.", "error");
        }
      } catch (err) {
        showToast("Network error connecting to server. Please try again.", "error");
      }
    };'''

content = content.replace(find_checkout, replace_checkout)

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated processCheckout to call local Next.js API route /api/payment/checkout")
