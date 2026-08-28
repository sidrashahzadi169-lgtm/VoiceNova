import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { readUsers, writeUsers, signJwt, UserRecord } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { provider } = await req.json();

    if (!provider || (provider !== "google" && provider !== "github")) {
      return NextResponse.json(
        { error: "Invalid OAuth provider selection" },
        { status: 400 }
      );
    }

    const users = await readUsers();
    // Simulate generic OAuth mock accounts
    const email = `oauth.${provider}@voicenova.ai`;
    const name = provider === "google" ? "Google Sandbox User" : "GitHub Sandbox User";

    let user = users.find((u) => u.email.toLowerCase() === email);

    if (!user) {
      // Create a mock OAuth profile if none exists
      user = {
        id: crypto.randomUUID(),
        name,
        email,
        salt: "", // OAuth bypass
        hash: "",
        plan: "Free Trial",
        registered: new Date().toISOString(),
        status: "Active",
        verified: true, // OAuth emails are pre-verified
      };
      users.push(user);
      await writeUsers(users);
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
      3600 // 1 hour session
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
    });

    return NextResponse.json({
      message: `${provider === "google" ? "Google" : "GitHub"} authentication successful`,
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
      { error: "An error occurred during OAuth authentication" },
      { status: 500 }
    );
  }
}
