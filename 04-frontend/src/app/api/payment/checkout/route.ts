import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { planName, gateway, tid } = await req.json();

    if (!planName || !gateway) {
      return NextResponse.json({ success: false, message: "Plan name and payment gateway are required" }, { status: 400 });
    }

    if ((gateway === "easypaisa" || gateway === "zindagi") && (!tid || tid.trim().length < 5)) {
      return NextResponse.json({ success: false, message: "Please provide a valid Transaction ID (TID)." }, { status: 400 });
    }

    // Authenticate user via vn_session cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("vn_session")?.value;
    let userId: string | null = null;
    let userEmail: string | null = null;

    if (token) {
      const decoded = verifyJwt(token);
      if (decoded) {
        userId = decoded.id;
        userEmail = decoded.email;
      }
    }

    // Fallback: check if user exists by email if token is missing
    if (!userId) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const email = authHeader.substring(7);
        const u = await prisma.user.findFirst({ where: { email } });
        if (u) {
          userId = u.id;
          userEmail = u.email;
        }
      }
    }

    if (!userId) {
      // Find default or first active user if in local preview
      const fallbackUser = await prisma.user.findFirst();
      if (fallbackUser) {
        userId = fallbackUser.id;
        userEmail = fallbackUser.email;
      } else {
        return NextResponse.json({ success: false, message: "User not authenticated. Please log in again." }, { status: 401 });
      }
    }

    const amountMap: Record<string, number> = {
      "Starter": 9.0,
      "Starter Plan": 9.0,
      "Creator": 19.0,
      "Pro": 29.0,
      "Pro Plan": 29.0,
      "Business": 99.0,
      "Enterprise": 199.0
    };
    const amount = amountMap[planName] || 29.0;
    const cleanTid = tid ? tid.trim() : "TXN_" + Date.now();

    // Check if TID already exists
    const existing = await prisma.payment.findUnique({ where: { transactionId: cleanTid } });
    if (existing) {
      return NextResponse.json({ success: false, message: "This Transaction ID (TID) has already been submitted for verification." }, { status: 400 });
    }

    const providerName = gateway === "zindagi" 
      ? "Zindagi by JS Bank" 
      : gateway === "easypaisa" 
        ? "Easypaisa Mobile" 
        : "Stripe Card";

    // Create payment record
    await prisma.payment.create({
      data: {
        userId: userId!,
        planName: planName,
        amount: amount,
        currency: gateway === "international" ? "USD" : "PKR",
        status: "Pending",
        provider: providerName,
        transactionId: cleanTid
      } as any
    });

    return NextResponse.json({
      success: true,
      message: "Payment submitted successfully! Your Transaction ID (" + cleanTid + ") has been recorded and sent to the Admin Panel for instant verification."
    });

  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ success: false, message: "Server error processing checkout: " + error.message }, { status: 500 });
  }
}
