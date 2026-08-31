import re

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'r') as f:
    content = f.read()

# Completely wipe out handleDownloadInvoice and rewrite it
new_func = '''const handleDownloadInvoice = (invId: string) => {
    const invoice = invoices.find(i => i.id === invId);
    if (!invoice) return;
    const rc = "VOICENOVA RECEIPT\\nID: " + invoice.id + "\\nDate: " + invoice.date + "\\nAmount: " + invoice.amount;
    const blob = new Blob([rc], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Invoice_' + invId + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Invoice downloaded successfully!');
  };'''

# Use regex to find the start of handleDownloadInvoice and end of the function block.
content = re.sub(r'const handleDownloadInvoice =.*?showToast.*?Downloaded.*?\}\s*;', new_func, content, flags=re.DOTALL)
content = re.sub(r'const handleDownloadInvoice =.*?(?:const handleUpgradeClick)', new_func + '\n\n  const handleUpgradeClick', content, flags=re.DOTALL)

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'w') as f:
    f.write(content)

print("Function rewritten")
