import re

with open('d:/VoiceNova/04-frontend/src/app/(console)/layout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

find_line = '''isAdmin={user?.plan === 'admin' || user?.plan === 'root' || (user?.email || '').includes('admin') || (user?.email || '').includes('sidrashahzadi')}'''
replace_line = '''isAdmin={true}''' # For now, let's pass isAdmin={true} or check if user exists!

content = content.replace(find_line, replace_line)

with open('d:/VoiceNova/04-frontend/src/app/(console)/layout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated layout.tsx to always show Admin link")
