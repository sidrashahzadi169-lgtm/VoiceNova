import re

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'r') as f:
    content = f.read()

# Replace the broken string assignment
broken = '''const receiptContent = 
========================================
         VOICENOVA RECEIPT
========================================
Invoice ID : Date       : Amount     : Status     : ========================================
Thank you for your subscription!
    ;'''

fixed = "const receiptContent = ========================================\\n         VOICENOVA RECEIPT\\n========================================\\nInvoice ID : \\nDate       : \\nAmount     : \\nStatus     : \\n========================================\\nThank you for your subscription!\\n;"

content = content.replace(broken, fixed)

# Check if there's any other broken parts
content = re.sub(r'const receiptContent = \n={40}.*?;', fixed, content, flags=re.DOTALL)

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'w') as f:
    f.write(content)

print("Fixed receipt content syntax")
