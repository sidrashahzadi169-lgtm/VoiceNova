import os
import glob

auth_files = glob.glob('d:/VoiceNova/04-frontend/src/app/api/auth/**/*.ts', recursive=True)

for file in auth_files:
    with open(file, 'r') as f:
        content = f.read()
    
    # Replace synchronous calls with async calls
    content = content.replace('readUsers()', 'await readUsers()')
    content = content.replace('writeUsers(users)', 'await writeUsers(users)')
    content = content.replace('writeUsers(users);', 'await writeUsers(users);')
    
    with open(file, 'w') as f:
        f.write(content)

print('Refactored routes to use await')
