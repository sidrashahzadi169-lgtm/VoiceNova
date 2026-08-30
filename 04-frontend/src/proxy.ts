import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "voicenova_neural_auth_secret_key_2026_prod";

function base64urlToBytes(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bytesToUtf8(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

// Standalone Web Crypto JWT verifier (Edge & Browser runtime compliant)
async function verifyMiddlewareJwt(token: string): Promise<any> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;

    // Load HMAC-SHA256 verification key
    const encoder = new TextEncoder();
    const secretBytes = encoder.encode(JWT_SECRET);
    const key = await crypto.subtle.importKey(
      "raw",
      secretBytes,
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["verify"]
    );

    const dataBytes = encoder.encode(`${header}.${payload}`);
    const signatureBytes = base64urlToBytes(signature);

    const isValid = await crypto.subtle.verify("HMAC", key, signatureBytes as any, dataBytes as any);
    if (!isValid) return null;

    const payloadBytes = base64urlToBytes(payload);
    const decodedPayload = JSON.parse(bytesToUtf8(payloadBytes));

    // Check expiration
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return decodedPayload;
  } catch (err) {
    return null;
  }
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("vn_session")?.value;
  const hasValidSession = token ? !!(await verifyMiddlewareJwt(token)) : false;

  // Paths requiring authentication
  const protectedRoutes = [
    "/dashboard",
    "/studio",
    "/library",
    "/projects",
    "/billing",
    "/profile",
    "/settings",
    "/analytics",
    "/help",
  ];

  // Auth pages to redirect away from if already logged in
  const authRoutes = ["/login", "/signup"];

  // Redirection checks
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!hasValidSession) {
      const loginUrl = new URL("/login", request.url);
      // Pass original redirect target
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (hasValidSession) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/studio/:path*",
    "/library/:path*",
    "/projects/:path*",
    "/billing/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/analytics/:path*",
    "/help/:path*",
    "/login",
    "/signup",
  ],
};

