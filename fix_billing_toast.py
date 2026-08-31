import re

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'r') as f:
    content = f.read()

# Replace the broken string
content = content.replace('showToast(Processing upgrade to ...);', 'showToast(Processing upgrade to ...);')

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'w') as f:
    f.write(content)

print("Done")
