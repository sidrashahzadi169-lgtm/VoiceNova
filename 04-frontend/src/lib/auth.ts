import crypto from "crypto";
import fs from "fs";
import path from "path";

const JWT_SECRET = process.env.JWT_SECRET || "voicenova_neural_auth_secret_key_2026_prod";
const DB_PATH = path.join(process.cwd(), "src/data/users.json");

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  salt: string;
  hash: string;
  plan: string;
  registered: string;
  status: "Active" | "Suspended";
  verified: boolean;
  verificationToken?: string;
  resetToken?: string;
  resetExpiry?: number;
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

// JSON Database operations
export function readUsers(): UserRecord[] {
  try {
    if (!fs.existsSync(path.dirname(DB_PATH))) {
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    }
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify([]));
    }
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function writeUsers(users: UserRecord[]): void {
  if (!fs.existsSync(path.dirname(DB_PATH))) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
}

// JWT custom signature generator (HMAC-SHA256 based tokens)
export function signJwt(payload: object, expiresInSeconds: number = 3600): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const jwtPayload = Buffer.from(JSON.stringify({ ...payload, exp })).toString("base64url");
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${jwtPayload}`)
    .digest("base64url");
  return `${header}.${jwtPayload}.${signature}`;
}

export function verifyJwt(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest("base64url");
    if (signature !== expectedSignature) return null;
    const decodedPayload = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null; // session expired
    }
    return decodedPayload;
  } catch {
    return null;
  }
}
