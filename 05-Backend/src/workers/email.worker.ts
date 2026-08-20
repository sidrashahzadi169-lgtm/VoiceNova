import nodemailer from "nodemailer";
import prisma from "../config/db";
import logger from "../utils/logger";
import { env } from "../config/env";

/**
 * Configure Nodemailer transport.
 * Using standard SMTP which maps directly to env vars.
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.mailtrap.io",
  port: parseInt(process.env.SMTP_PORT || "2525"),
  auth: {
    user: process.env.SMTP_USER || "mock_user",
    pass: process.env.SMTP_PASS || "mock_pass",
  },
});

const SENDER_EMAIL = process.env.SMTP_FROM || '"VoiceNova Team" <noreply@voicenova.ai>';
const BATCH_SIZE = 20;

export class EmailWorker {
  private static isRunning = false;

  /**
   * Main processor function
   */
  public static async processQueue() {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      // 1. Fetch pending emails or retries (Failed but under max attempts)
      const jobs = await prisma.emailJob.findMany({
        where: {
          status: { in: ["Pending"] },
        },
        take: BATCH_SIZE,
        orderBy: { createdAt: "asc" },
      });

      if (jobs.length === 0) {
        this.isRunning = false;
        return;
      }

      logger.info(`[EmailWorker] Processing ${jobs.length} emails...`);

      for (const job of jobs) {
        try {
          // Increment attempt BEFORE sending in case of crash
          await prisma.emailJob.update({
            where: { id: job.id },
            data: { attempts: job.attempts + 1 },
          });

          // Dispatch email
          await transporter.sendMail({
            from: SENDER_EMAIL,
            to: job.to,
            subject: job.subject,
            html: job.htmlBody,
          });

          // Mark Success
          await prisma.emailJob.update({
            where: { id: job.id },
            data: { status: "Sent", errorLog: null },
          });

          logger.info(`[EmailWorker] Sent email to ${job.to}`);
        } catch (err) {
          const maxAttempts = 3;
          const attempt = job.attempts + 1;
          const errorMsg = (err as Error).message;

          logger.error(`[EmailWorker] Failed to send email to ${job.to}: ${errorMsg}`);

          // Mark Failed or keep Pending if retries left
          await prisma.emailJob.update({
            where: { id: job.id },
            data: {
              status: attempt >= maxAttempts ? "Failed" : "Pending",
              errorLog: errorMsg,
            },
          });
        }
      }
    } catch (err) {
      logger.error(`[EmailWorker] Queue Error: ${(err as Error).message}`);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Starts the background worker
   */
  public static start() {
    logger.info("[EmailWorker] Starting background email processing queue...");
    // Run every 30 seconds
    setInterval(() => {
      this.processQueue().catch(() => {});
    }, 30000);
  }
}
