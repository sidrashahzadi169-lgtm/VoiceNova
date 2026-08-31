import re

with open('d:/VoiceNova/04-frontend/src/app/admin/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('https://voice-nova-sooty.vercel.app/api/admin/payments', '/api/admin/payments')

with open('d:/VoiceNova/04-frontend/src/app/admin/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated admin page URLs to use local Next.js API routes")
