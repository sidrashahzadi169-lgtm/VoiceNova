import re

with open('d:/VoiceNova/04-frontend/src/app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find('{/* Login Modal */}')
end_idx = content.find('{/* Toast Alert popup notification */}')

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + content[end_idx:]
    print("Modals removed!")
else:
    print("Could not find boundaries")

with open('d:/VoiceNova/04-frontend/src/app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
