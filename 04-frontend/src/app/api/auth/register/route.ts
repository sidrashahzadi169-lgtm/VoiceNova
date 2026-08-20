import { NextResponse } from "next/server";
import crypto from "crypto";
import { readUsers, writeUsers, hashPassword, UserRecord } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Field validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Please fill in all fields" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const users = readUsers();
    const emailLower = email.toLowerCase().trim();

    // Check if user already exists
    if (users.some((u) => u.email.toLowerCase() === emailLower)) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 400 }
      );
    }

    // Hash password and initialize user record
    const { salt, hash } = hashPassword(password);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser: UserRecord = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: emailLower,
      salt,
      hash,
      plan: "Free Trial",
      registered: new Date().toISOString(),
      status: "Active",
      verified: false,
      verificationToken,
    };

    users.push(newUser);
    writeUsers(users);

    return NextResponse.json(
      {
        message: "Registration successful! Please verify your email.",
        verificationToken, // Sent back to simulate email delivery link easily
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
