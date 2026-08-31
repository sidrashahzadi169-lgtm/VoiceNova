import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";


const JWT_SECRET = process.env.JWT_SECRET || "voicenova_neural_auth_secret_key_2026_prod";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("vn_session")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
    const userId = decoded.id;

    const reqBody = await req.json(); const plan = reqBody.plan;

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

    const provider = reqBody.paymentMethod || "Easypaisa";

    if (provider === "easypaisa" || provider === "zindagi") {
      // 1. EASYPAISA (Local Pakistan Flow) -> MANUAL APPROVAL
      if (amount > 0) {
        await prisma.payment.create({
          data: {
            userId,
            amount,
            currency: "PKR",
            status: "Pending",
            provider: provider === "zindagi" ? "JS Bank Zindagi" : "Easypaisa",
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
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}



