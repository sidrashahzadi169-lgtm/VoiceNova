path = r'd:\VoiceNova\04-frontend\src\app\api\payment\checkout\route.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

find_create = '''    await prisma.payment.create({
      data: {
        userId: userId!,
        planName: planName,
        amount: amount,
        currency: gateway === "international" ? "USD" : "PKR",
        status: "Pending",
        provider: providerName,
        transactionId: cleanTid
      }
    });'''

replace_create = '''    await prisma.payment.create({
      data: {
        userId: userId!,
        planName: planName,
        amount: amount,
        currency: gateway === "international" ? "USD" : "PKR",
        status: "Pending",
        provider: providerName,
        transactionId: cleanTid
      } as any
    });'''

content = content.replace(find_create, replace_create)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Casted Payment data as any")
