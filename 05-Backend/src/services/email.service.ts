import prisma from "../config/db";
import logger from "../utils/logger";

/**
 * Base layout template to maintain consistent premium branding across all emails.
 */
const baseTemplate = (title: string, bodyContent: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #0d0f12;
      color: #e2e8f0;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #13171d;
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }
    .header {
      background: linear-gradient(135deg, #7B2CBF, #4A00E0);
      padding: 30px 40px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .content {
      padding: 40px;
    }
    .content p {
      font-size: 16px;
      line-height: 1.6;
      color: #94a3b8;
      margin-bottom: 20px;
    }
    .content h2 {
      color: #ffffff;
      font-size: 20px;
      margin-bottom: 16px;
      margin-top: 0;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #9D4EDD, #7B2CBF);
      color: #ffffff;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 8px;
      font-weight: 600;
      margin-top: 10px;
      margin-bottom: 20px;
      text-align: center;
    }
    .footer {
      background: #0b0d10;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>VoiceNova</h1>
    </div>
    <div class="content">
      <h2>${title}</h2>
      ${bodyContent}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} VoiceNova. All rights reserved.</p>
      <p>This is an automated message, please do not reply.</p>
    </div>
  </div>
</body>
</html>
`;

export class EmailService {
  /**
   * Internal wrapper to queue emails instead of sending them synchronously.
   */
  private static async queueEmail(to: string, subject: string, htmlBody: string) {
    try {
      await prisma.emailJob.create({
        data: {
          to,
          subject,
          htmlBody,
        },
      });
      logger.info(`[EmailService] Queued email to ${to} - ${subject}`);
    } catch (error) {
      logger.error(`[EmailService] Failed to queue email to ${to}: ${(error as Error).message}`);
    }
  }

  // ==========================================
  // AUTHENTICATION EMAILS
  // ==========================================

  public static async sendWelcomeEmail(to: string, name: string) {
    const body = `
      <p>Hi ${name},</p>
      <p>Welcome to VoiceNova! We are thrilled to have you on board.</p>
      <p>Start turning your scripts into lifelike neural audio with our state-of-the-art voice cloning technology.</p>
      <a href="${process.env.FRONTEND_URL}/studio" class="btn">Go to Studio</a>
    `;
    await this.queueEmail(to, "Welcome to VoiceNova!", baseTemplate("Welcome Aboard", body));
  }

  public static async sendVerificationEmail(to: string, token: string) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    const body = `
      <p>Thank you for registering. Please verify your email address to unlock all VoiceNova features.</p>
      <a href="${verificationUrl}" class="btn">Verify Email Address</a>
      <p>If you didn't create this account, you can safely ignore this email.</p>
    `;
    await this.queueEmail(to, "Verify your VoiceNova Email", baseTemplate("Verify Your Email", body));
  }

  public static async sendPasswordReset(to: string, token: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const body = `
      <p>We received a request to reset your VoiceNova password.</p>
      <a href="${resetUrl}" class="btn">Reset Password</a>
      <p>This link will expire in 1 hour. If you didn't request a reset, you can safely ignore this email.</p>
    `;
    await this.queueEmail(to, "Reset your VoiceNova Password", baseTemplate("Password Reset Request", body));
  }

  public static async sendLoginAlert(to: string, ip: string, device: string) {
    const body = `
      <p>We noticed a new login to your VoiceNova account.</p>
      <ul>
        <li style="color: #94a3b8;"><strong>IP Address:</strong> ${ip}</li>
        <li style="color: #94a3b8;"><strong>Device/Browser:</strong> ${device}</li>
        <li style="color: #94a3b8;"><strong>Time:</strong> ${new Date().toLocaleString()}</li>
      </ul>
      <p>If this was you, you don't need to do anything. If you don't recognize this activity, please change your password immediately.</p>
    `;
    await this.queueEmail(to, "New Login to your Account", baseTemplate("New Login Detected", body));
  }

  // ==========================================
  // SUBSCRIPTION EMAILS
  // ==========================================

  public static async sendSubscriptionActivated(to: string, planName: string, credits: number) {
    const body = `
      <p>Great news! Your <strong>${planName}</strong> subscription is now active.</p>
      <p>You have been granted <strong>${credits.toLocaleString()} characters</strong> to use for your audio generation this cycle.</p>
      <a href="${process.env.FRONTEND_URL}/projects" class="btn">Start Creating</a>
    `;
    await this.queueEmail(to, `VoiceNova ${planName} Activated`, baseTemplate("Subscription Upgraded", body));
  }

  public static async sendPaymentSuccess(to: string, amount: string, invoiceUrl: string) {
    const body = `
      <p>We have successfully processed your payment of <strong>${amount}</strong>.</p>
      <p>Your subscription credits have been replenished.</p>
      <a href="${invoiceUrl}" class="btn" style="background: transparent; border: 1px solid #7B2CBF; color: #7B2CBF;">View Invoice</a>
    `;
    await this.queueEmail(to, "VoiceNova Payment Successful", baseTemplate("Payment Confirmed", body));
  }

  public static async sendPaymentFailed(to: string) {
    const body = `
      <p>We encountered an issue processing the payment for your VoiceNova subscription renewal.</p>
      <p>To avoid service interruption, please update your payment method via the billing portal.</p>
      <a href="${process.env.FRONTEND_URL}/billing" class="btn">Update Payment Method</a>
    `;
    await this.queueEmail(to, "Action Required: VoiceNova Payment Failed", baseTemplate("Payment Failed", body));
  }

  // ==========================================
  // VOICE GENERATION & USAGE EMAILS
  // ==========================================

  public static async sendMonthlySummary(to: string, charsUsed: number, totalGens: number) {
    const body = `
      <p>Here is your VoiceNova usage summary for the past month:</p>
      <ul>
        <li style="color: #94a3b8;"><strong>Characters Synthesized:</strong> ${charsUsed.toLocaleString()}</li>
        <li style="color: #94a3b8;"><strong>Total Generations:</strong> ${totalGens}</li>
      </ul>
      <a href="${process.env.FRONTEND_URL}/analytics" class="btn">View Full Analytics</a>
    `;
    await this.queueEmail(to, "Your VoiceNova Monthly Usage Summary", baseTemplate("Monthly Summary", body));
  }

  // ==========================================
  // ADMIN EMAILS
  // ==========================================

  public static async sendAdminNewUserRegistration(adminEmail: string, userEmail: string) {
    const body = `
      <p>A new user has registered on the platform.</p>
      <p><strong>Email:</strong> ${userEmail}</p>
    `;
    await this.queueEmail(adminEmail, "[Admin] New User Registration", baseTemplate("New User Joined", body));
  }
}
