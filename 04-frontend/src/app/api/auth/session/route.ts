import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("vn_session")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      token,
      user: {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        plan: payload.plan,
        verified: payload.verified,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred fetching session" },
      { status: 500 }
    );
  }
}
