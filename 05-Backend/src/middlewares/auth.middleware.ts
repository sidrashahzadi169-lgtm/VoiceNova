import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/db";
import logger from "../utils/logger";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    plan: string;
    verified: boolean;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || "voicenova_neural_auth_secret_key_2026_prod";

export async function protect(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      // Verify active, non-suspended, non-deleted user
      let user = await prisma.user.findFirst({
        where: {
          id: decoded.id,
          deletedAt: null,
          status: "Active",
        },
      });

      if (!user) {
        res.status(401).json({ success: false, message: "Not authorized, user not found or suspended" });
        return;
      }

      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        verified: user.verified,
      };

      return next();
    } catch (error) {
      res.status(401).json({ success: false, message: "Not authorized, invalid token" });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: "Not authorized, no token provided" });
    return;
  }
}

export function adminOnly(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Not authorized" });
    return;
  }

  const emailLower = req.user.email.toLowerCase().trim();
  const planLower = req.user.plan.toLowerCase();
  
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@voicenova.ai").toLowerCase().trim();

  const isAdmin = emailLower === adminEmail || 
                  planLower === "admin" || 
                  planLower === "root";

  if (!isAdmin) {
    res.status(403).json({ success: false, message: "Forbidden: Admin access only" });
    return;
  }

  next();
}

