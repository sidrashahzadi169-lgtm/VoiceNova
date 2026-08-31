path = r'd:\VoiceNova\04-frontend\src\app\api\admin\payments\[id]\approve\route.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('const newPlan = payment.planName || "Pro";', 'const newPlan = (payment as any).planName || "Pro";')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Casted payment.planName as any")
