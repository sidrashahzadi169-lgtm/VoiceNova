import re
with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'r') as f:
    content = f.read()

content = content.replace('showToast(\ API keys', 'showToast(${paymentMethod.toUpperCase()} API keys')
content = content.replace('showToast(\Verifying', 'showToast(Verifying')

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'w') as f:
    f.write(content)
print("Done")
