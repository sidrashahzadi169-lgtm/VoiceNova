content = '''import crypto from "crypto";
import prisma from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "voicenova_neural_auth_secret_key_2026_prod";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  salt: string;
  hash: string;
  plan: string;
  registered?: string;
  status: "Active" | "Suspended";
  verified: boolean;
  verificationToken?: string | null;
  resetToken?: string | null;
  resetExpiry?: Date | null;
}

// Password cryptography operations
export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, hash: string): boolean {
  const checkHash = crypto.scryptSync(password, salt, 64).toString("hex");
  return checkHash === hash;
}

// Prisma Database operations
export async function readUsers(): Promise<UserRecord[]> {
  try {
    const users = await prisma.user.findMany();
    return users as any as UserRecord[];
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function writeUsers(users: UserRecord[]): Promise<void> {
  for (const u of users) {
    try {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {
          name: u.name,
          salt: u.salt,
          hash: u.hash,
          plan: u.plan,
          status: u.status,
          verified: u.verified,
          verificationToken: u.verificationToken,
          resetToken: u.resetToken,
          resetExpiry: u.resetExpiry ? new Date(u.resetExpiry) : null
        },
        create: {
          name: u.name,
          email: u.email,
          salt: u.salt,
          hash: u.hash,
          plan: u.plan,
          status: u.status,
          verified: u.verified,
          verificationToken: u.verificationToken,
          resetToken: u.resetToken,
          resetExpiry: u.resetExpiry ? new Date(u.resetExpiry) : null
        }
      });
    } catch (e) {
      console.error(e);
    }
  }
}

// JWT custom signature generator (HMAC-SHA256 based tokens)
export function signJwt(payload: object, expiresInSeconds: number = 3600): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const jwtPayload = Buffer.from(JSON.stringify({ ...payload, exp })).toString("base64url");
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update( + "" + ${header}. + "" + )
    .digest("base64url");
  return  + "" + ${header}.. + "" + ;
}

export function verifyJwt(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update( + "" + ${header}. + "" + )
      .digest("base64url");
    if (signature !== expectedSignature) return null;
    const decodedPayload = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return decodedPayload;
  } catch {
    return null;
  }
}
'''
with open('d:/VoiceNova/04-frontend/src/lib/auth.ts', 'w') as f:
    f.write(content)
