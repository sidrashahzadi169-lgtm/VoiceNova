import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readUsers, verifyPassword, signJwt } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password, rememberMe } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const users = await readUsers();
    const emailLower = email.toLowerCase().trim();
    const user = users.find((u) => u.email.toLowerCase() === emailLower);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (user.status === "Suspended") {
      return NextResponse.json(
        { error: "Your account has been suspended. Please contact support." },
        { status: 403 }
      );
    }

    // Verify hashed password
    const isPasswordCorrect = verifyPassword(password, user.salt, user.hash);
    if (!isPasswordCorrect) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Sign JWT session token
    const token = signJwt(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        verified: user.verified,
      },
      rememberMe ? 30 * 24 * 3600 : 3600 // 30 days or 1 hour
    );

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set({
      name: "vn_session",
      value: token,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: rememberMe ? 30 * 24 * 3600 : undefined,
    });

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        verified: user.verified,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
