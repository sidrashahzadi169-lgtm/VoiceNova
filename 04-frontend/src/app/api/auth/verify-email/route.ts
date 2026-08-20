import { NextResponse } from "next/server";
import { readUsers, writeUsers } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Verification token is required" }, { status: 400 });
    }

    const users = readUsers();
    const user = users.find((u) => u.verificationToken === token);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired email verification token" },
        { status: 400 }
      );
    }

    // Set user as verified
    user.verified = true;
    delete user.verificationToken;

    writeUsers(users);

    return NextResponse.json({
      message: "Email verification successful! Your account is now fully active.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred verifying email" },
      { status: 500 }
    );
  }
}
