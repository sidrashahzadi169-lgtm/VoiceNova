import re

with open('d:/VoiceNova/05-Backend/src/controllers/payment.controller.ts', 'r', encoding='utf-8') as f:
    content = f.read()

find_logic = '''    try {
      const provider = PaymentFactory.getProvider(gateway);
      
      const successUrl = process.env.FRONTEND_URL 
        ? process.env.FRONTEND_URL + "/payment-success"
        : "http://localhost:3000/payment-success";'''

replace_logic = '''    try {
      // For local manual payments (Easypaisa/Zindagi)
      if (gateway === "easypaisa" || gateway === "zindagi") {
        const tid = req.body.tid;
        if (!tid || tid.length < 5) {
          res.status(400).json({ success: false, message: "Valid Transaction ID (TID) is required" });
          return;
        }
        await prisma.payment.create({
          data: {
            userId,
            amount,
            currency: "PKR",
            status: "Pending",
            provider: gateway === "zindagi" ? "Zindagi by JS Bank" : "Easypaisa Mobile",
            transactionId: tid
          }
        });
        res.status(200).json({ success: true, data: { paymentUrl: "/payment-success?status=pending" } });
        return;
      }

      const provider = PaymentFactory.getProvider(gateway);
      
      const successUrl = process.env.FRONTEND_URL 
        ? process.env.FRONTEND_URL + "/payment-success"
        : "http://localhost:3000/payment-success";'''

content = content.replace(find_logic, replace_logic)

with open('d:/VoiceNova/05-Backend/src/controllers/payment.controller.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated backend to support pending TID payments")
