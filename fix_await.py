import glob

auth_files = glob.glob('d:/VoiceNova/04-frontend/src/app/api/auth/**/*.ts', recursive=True)
for file in auth_files:
    with open(file, 'r') as f:
        content = f.read()
    content = content.replace('await await', 'await')
    with open(file, 'w') as f:
        f.write(content)
