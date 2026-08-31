import re

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'r') as f:
    content = f.read()

new_invoice_func = '''const handleDownloadInvoice = (invId: string) => {
    // Generate a real receipt file
    const invoice = invoices.find(i => i.id === invId);
    if (!invoice) return;
    
    const receiptContent = 
========================================
         VOICENOVA RECEIPT
========================================
Invoice ID : \
Date       : \
Amount     : \
Status     : \
========================================
Thank you for your subscription!
    ;
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = VoiceNova_\.txt;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast(Invoice \ downloaded successfully!);
  };'''

content = re.sub(r'const handleDownloadInvoice = \(invId: string\) => \{.*?  \};', new_invoice_func, content, flags=re.DOTALL)

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'w') as f:
    f.write(content)
print("Done")
