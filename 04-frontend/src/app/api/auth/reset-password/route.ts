import { NextResponse } from "next/server";
import { readUsers, writeUsers, hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const users = readUsers();
    const user = users.find(
      (u) => u.resetToken === token && u.resetExpiry && u.resetExpiry > Date.now()
    );

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired password reset token" },
        { status: 400 }
      );
    }

    // Hash the new password and clear the reset token
    const { salt, hash } = hashPassword(password);
    user.salt = salt;
    user.hash = hash;
    delete user.resetToken;
    delete user.resetExpiry;

    writeUsers(users);

    return NextResponse.json({
      message: "Password reset successful! You can now log in.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred resetting password" },
      { status: 500 }
    );
  }
}
