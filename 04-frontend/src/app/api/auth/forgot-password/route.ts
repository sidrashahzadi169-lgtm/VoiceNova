import { NextResponse } from "next/server";
import crypto from "crypto";
import { readUsers, writeUsers } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const users = readUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!user) {
      // Return success to avoid email enumeration, but add developer info
      return NextResponse.json({
        message: "If the email is registered, a password reset link has been sent.",
      });
    }

    // Generate reset token and set 1-hour expiry
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetExpiry = Date.now() + 3600000; // 1 hour

    writeUsers(users);

    return NextResponse.json({
      message: "Password reset link generated successfully.",
      resetToken, // Returned for simulated developer UI testing convenience
    });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred during password recovery" },
      { status: 500 }
    );
  }
}
