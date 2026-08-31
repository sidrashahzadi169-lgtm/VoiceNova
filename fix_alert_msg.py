path = r'd:\VoiceNova\04-frontend\src\app\(console)\billing\page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

find_msg = 'showToast(data.message || "Payment submitted successfully!", "success");'
replace_msg = 'alert("Payment Submitted! Please wait for Admin approval. Your payment request with TID (" + tid + ") has been sent to the Admin."); setCheckoutModalOpen(false); setTid("");'

content = content.replace(find_msg, replace_msg)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated success message to explicit alert!")
