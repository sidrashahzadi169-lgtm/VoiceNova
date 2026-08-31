import re

with open('d:/VoiceNova/04-frontend/src/app/api/payment/mock-checkout/route.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the payment logic
logic_find = '''    // Update user plan
    await prisma.user.update({
      where: { id: userId },
      data: { plan: plan },
    });

    // Deactivate old subscriptions
    await prisma.subscription.updateMany({
      where: { userId, status: "Active" },
      data: { status: "Canceled" },
    });

    // Create new subscription
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    await prisma.subscription.create({
      data: {
        userId,
        plan,
        status: "Active",
        creditLimit: limit,
        creditUsed: 0,
        startDate: new Date(),
        endDate: nextMonth,
      },
    });

    // Create payment history entry
    if (amount > 0) {
      await prisma.payment.create({
        data: {
          userId,
          amount,
          currency: "USD",
          status: "Pending",
          provider: "Easypaisa",
          transactionId: reqBody.tid || ("trx_" + Math.random().toString(36).substring(2, 10)),
        },
      });
    }

    return NextResponse.json({ success: true, url: "/payment-success" });'''

logic_repl = '''    const provider = reqBody.paymentMethod || "Easypaisa";

    if (provider === "easypaisa") {
      // 1. EASYPAISA (Local Pakistan Flow) -> MANUAL APPROVAL
      if (amount > 0) {
        await prisma.payment.create({
          data: {
            userId,
            amount,
            currency: "PKR",
            status: "Pending",
            provider: "Easypaisa",
            transactionId: reqBody.tid || ("TID_" + Math.random().toString(36).substring(2, 10)),
          },
        });
      }
      return NextResponse.json({ success: true, url: "/payment-success?status=pending" });
    } else {
      // 2. STRIPE / CREDIT CARD (International Flow) -> AUTOMATIC APPROVAL (Simulated)
      await prisma.user.update({
        where: { id: userId },
        data: { plan: plan },
      });

      await prisma.subscription.updateMany({
        where: { userId, status: "Active" },
        data: { status: "Canceled" },
      });

      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      await prisma.subscription.create({
        data: {
          userId,
          plan,
          status: "Active",
          creditLimit: limit,
          creditUsed: 0,
          startDate: new Date(),
          endDate: nextMonth,
        },
      });

      if (amount > 0) {
        await prisma.payment.create({
          data: {
            userId,
            amount,
            currency: "USD",
            status: "Paid",
            provider: "Stripe",
            transactionId: "ch_" + Math.random().toString(36).substring(2, 15),
          },
        });
      }
      return NextResponse.json({ success: true, url: "/payment-success" });
    }'''
content = content.replace(logic_find, logic_repl)

with open('d:/VoiceNova/04-frontend/src/app/api/payment/mock-checkout/route.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Checkout logic updated")
