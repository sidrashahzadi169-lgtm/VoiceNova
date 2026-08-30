import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "voicenova_neural_auth_secret_key_2026_prod";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("vn_session")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;

    const { plan } = await req.json();

    // Map plan names to credit limits
    const creditMap: Record<string, number> = {
      "Starter Plan": 100000,
      "Pro Plan": 500000,
      "Enterprise": 2000000,
    };
    const limit = creditMap[plan] || 50000;

    const amountMap: Record<string, number> = {
      "Starter Plan": 9.0,
      "Pro Plan": 29.0,
      "Enterprise": 99.0,
    };
    const amount = amountMap[plan] || 0;

    // Update user plan
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
          status: "Paid",
          provider: "Easypaisa",
          transactionId: "trx_" + Math.random().toString(36).substring(2, 10),
        },
      });
    }

    return NextResponse.json({ success: true, url: "/payment-success" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
