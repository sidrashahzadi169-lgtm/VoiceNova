import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { EmailService } from "../services/email.service";
import prisma from "../config/db";

const JWT_SECRET = process.env.JWT_SECRET || "voicenova_neural_auth_secret_key_2026_prod";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "voicenova_refresh_secret_key_2026_prod";

// Generate JWT Access Token
const generateAccessToken = (userId: string, email: string, plan: string) => {
  return jwt.sign({ id: userId, email, plan }, JWT_SECRET, { expiresIn: "1h" });
};

// Generate JWT Refresh Token
const generateRefreshToken = (userId: string) => {
  return jwt.sign({ id: userId }, JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: "Please fill in all fields" });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
      return;
    }

    const emailLower = email.toLowerCase().trim();

    // Check if email already registered
    const userExists = await prisma.user.findFirst({
      where: { email: emailLower, deletedAt: null }
    });

    if (userExists) {
      res.status(400).json({ success: false, message: "Email is already registered" });
      return;
    }

    // Hash password using salt
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: emailLower,
        salt,
        hash,
        plan: "Free Trial",
        status: "Active",
        verified: false,
        verificationToken,
      }
    });

    // Fire and forget welcome email & admin alert
    EmailService.sendWelcomeEmail(email, name).catch(() => {});
    EmailService.sendAdminNewUserRegistration(process.env.ADMIN_EMAIL || "admin@voicenova.ai", email).catch(() => {});

    res.status(201).json({
      success: true,
      message: "Registration successful! Verification token generated.",
      data: {
        userId: newUser.id,
        email: newUser.email
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: "Email and password are required" });
      return;
    }

    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase().trim(), deletedAt: null }
    });

    if (!user || user.status === "Suspended") {
      res.status(401).json({ success: false, message: "Invalid credentials or account suspended" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.hash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const accessToken = generateAccessToken(user.id, user.email, user.plan);
    const refreshToken = generateRefreshToken(user.id);

    // Trigger login alert asynchronously
    const ip = req.ip || req.socket.remoteAddress || "Unknown IP";
    const device = req.headers["user-agent"] || "Unknown Device";
    EmailService.sendLoginAlert(email, ip, device).catch(() => {});

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          plan: user.plan,
          verified: user.verified
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Standard stateless logout simply instructs client to drop tokens
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ success: false, message: "Refresh token is required" });
      return;
    }

    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as any;
    const user = await prisma.user.findFirst({
      where: { id: decoded.id, deletedAt: null, status: "Active" }
    });

    if (!user) {
      res.status(401).json({ success: false, message: "Invalid refresh token session" });
      return;
    }

    const accessToken = generateAccessToken(user.id, user.email, user.plan);
    res.status(200).json({
      success: true,
      data: { accessToken }
    });
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid refresh token" });
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: "Email is required" });
      return;
    }

    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase().trim(), deletedAt: null }
    });

    if (!user) {
      // Prevents enum attacks, responds successfully
      res.status(200).json({ success: true, message: "If registered, a recovery link has been generated." });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetExpiry }
    });

    // Send the actual email
    EmailService.sendPasswordReset(email, resetToken).catch(() => {});

    res.status(200).json({
      success: true,
      message: "Recovery token generated successfully. Please check your email."
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({ success: false, message: "Token and password are required" });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetExpiry: { gt: new Date() },
        deletedAt: null
      }
    });

    if (!user) {
      res.status(400).json({ success: false, message: "Invalid or expired password reset token" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        salt,
        hash,
        resetToken: null,
        resetExpiry: null
      }
    });

    res.status(200).json({ success: true, message: "Password updated successfully. You can now log in." });
  } catch (error) {
    next(error);
  }
}
