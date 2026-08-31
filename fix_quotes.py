import re

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'r') as f:
    content = f.read()

broken = '''const rc = "VOICENOVA RECEIPT
  ID: " + invoice.id + "
  Date: " + invoice.date + "
  Amount: " + invoice.amount;'''

fixed = 'const rc = "VOICENOVA RECEIPT\\nID: " + invoice.id + "\\nDate: " + invoice.date + "\\nAmount: " + invoice.amount;'

content = content.replace(broken, fixed)

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'w') as f:
    f.write(content)

print("Fixed")
