import re

with open('d:/VoiceNova/04-frontend/src/app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove inputs
content = re.sub(r'const \[loginEmail, setLoginEmail\] = useState\(""\);\n', '', content)
content = re.sub(r'const \[loginPassword, setLoginPassword\] = useState\(""\);\n', '', content)
content = re.sub(r'const \[signupName, setSignupName\] = useState\(""\);\n', '', content)
content = re.sub(r'const \[signupEmail, setSignupEmail\] = useState\(""\);\n', '', content)
content = re.sub(r'const \[signupPassword, setSignupPassword\] = useState\(""\);\n', '', content)

with open('d:/VoiceNova/04-frontend/src/app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
