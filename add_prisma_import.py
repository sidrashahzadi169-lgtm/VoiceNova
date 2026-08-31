path = r'd:\VoiceNova\04-frontend\src\app\api\auth\login\route.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'import prisma' not in content:
    content = 'import prisma from "@/lib/prisma";\n' + content

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Added prisma import to login/route.ts")
