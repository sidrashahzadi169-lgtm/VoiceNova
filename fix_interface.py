import re

with open('d:/VoiceNova/04-frontend/src/app/admin/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

interface_find = '''interface AdminPayment {
  invoice: string;
  client: string;
  date: string;
  amt: string;
  gateway: string;
  status: "Paid" | "Refund Pending" | "Refunded";
}'''

interface_repl = '''interface AdminPayment {
  id?: string;
  invoice?: string;
  client?: string;
  date?: string;
  amt?: string;
  gateway?: string;
  status?: string;
  user?: { name: string; email: string };
  transactionId?: string;
  createdAt?: string | Date;
  amount?: number;
  currency?: string;
  provider?: string;
}'''

content = content.replace(interface_find, interface_repl)

with open('d:/VoiceNova/04-frontend/src/app/admin/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Interface fixed")
