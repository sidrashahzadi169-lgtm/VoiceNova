import os

path = r'd:\VoiceNova\04-frontend\src\app\api\admin\payments\[id]\approve\route.ts'
os.makedirs(os.path.dirname(path), exist_ok=True)

code = '''import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!payment) {
      return NextResponse.json({ success: false, message: "Payment record not found" }, { status: 404 });
    }

    // Update payment to Paid
    await prisma.payment.update({
      where: { id },
      data: { status: "Paid" }
    });

    // Determine target plan
    const newPlan = payment.planName || "Pro";

    // Upgrade user's plan
    await prisma.user.update({
      where: { id: payment.userId },
      data: { plan: newPlan }
    });

    // Update or create active subscription
    await prisma.subscription.updateMany({
      where: { userId: payment.userId, status: "Active" },
      data: { status: "Canceled" }
    });

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    await prisma.subscription.create({
      data: {
        userId: payment.userId,
        plan: newPlan,
        status: "Active",
        creditLimit: newPlan === "Business" || newPlan === "Enterprise" ? 1000000 : 500000,
        creditUsed: 0,
        startDate: new Date(),
        endDate: endDate,
        pricePaid: payment.amount
      }
    });

    return NextResponse.json({
      success: true,
      message: Payment approved! User upgraded to .
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
'''

with open(path, 'w', encoding='utf-8') as f:
    f.write(code)
print("Created approve route cleanly!")
