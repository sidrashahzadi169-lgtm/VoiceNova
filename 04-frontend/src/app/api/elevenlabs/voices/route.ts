/**
 * @file src/app/api/elevenlabs/voices/route.ts
 * @description Next.js server-side API route proxy for ElevenLabs voice catalog.
 *
 * Security: This route is server-side only — it forwards requests to the backend
 * and never exposes ElevenLabs credentials to the browser.
 * The ElevenLabs API key lives exclusively in 05-Backend/.env.
 *
 * The frontend calls: GET /api/elevenlabs/voices
 * This proxy calls:   GET http://localhost:5000/api/voice-generations/provider/voices
 */

import { NextRequest, NextResponse } from "next/server";

// Backend base URL — never exposed to the client bundle
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Forward the Authorization header from the browser session
    const authHeader = request.headers.get("Authorization");

    const backendResponse = await fetch(
      `${BACKEND_URL}/api/voice-generations/provider/voices`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        // 10 second timeout for this lightweight listing call
        signal: AbortSignal.timeout(10_000),
      }
    );

    const data = await backendResponse.json();

    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    const err = error as Error;

    if (err.name === "TimeoutError" || err.name === "AbortError") {
      return NextResponse.json(
        { success: false, message: "Voice catalog request timed out. Please try again." },
        { status: 504 }
      );
    }

    console.error("[API Proxy] /api/elevenlabs/voices error:", err.message);

    return NextResponse.json(
      { success: false, message: "Failed to retrieve voice catalog from provider." },
      { status: 502 }
    );
  }
}
