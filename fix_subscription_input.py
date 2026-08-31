path = r'd:\VoiceNova\04-frontend\src\app\api\admin\payments\[id]\approve\route.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('pricePaid: payment.amount', '')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed pricePaid property")
