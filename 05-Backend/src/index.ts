import dotenv from "dotenv";
// Load environment variables FIRST — before any other imports that may read process.env
dotenv.config();

// Validate environment — fails fast with clear error if config is invalid
import "./config/env";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { setupSwagger } from "./utils/swagger";
import { errorHandler } from "./middlewares/error.middleware";
import { apiLimiter } from "./middlewares/rate-limit.middleware";
import apiRoutes from "./routes";
import logger from "./utils/logger";
import { env } from "./config/env";
import { AIProviderFactory } from "./providers/AIProviderFactory";
import { EmailWorker } from "./workers/email.worker";

const app = express();

// ─── Security Shields ─────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // allow audio streaming cross-origin
}));
app.use(cors({
  origin: function (origin, callback) { callback(null, true); },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  // Expose these so the browser can read filename + size from the download response
  exposedHeaders: ["Content-Disposition", "Content-Length", "Content-Type"],
  credentials: true,
}));

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  if (req.originalUrl === '/api/stripe/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true }));

// ─── HTTP Loggers ─────────────────────────────────────────────────────────────
app.use(morgan("combined", {
  stream: { write: (message) => logger.http(message.trim()) }
}));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
app.use("/api", apiLimiter);

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api", apiRoutes);

// ─── Swagger Docs ─────────────────────────────────────────────────────────────
setupSwagger(app);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "VoiceNova Neural REST API Foundation Online",
    provider: AIProviderFactory.getActiveProviderName(),
    swaggerDocs: "/api-docs",
  });
});

// ─── 404 Catch-all ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found on endpoint: ${req.method} ${req.originalUrl}`
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Bootstrap ────────────────────────────────────────────────────────────────
async function bootstrap() {
  // Warn about placeholder API key
  if (env.ELEVENLABS_API_KEY === "your_elevenlabs_api_key_here") {
    logger.warn(
      "⚠️  ELEVENLABS_API_KEY is set to the placeholder value. " +
      "Replace it with your real key from https://elevenlabs.io/app/settings/api-keys"
    );
  }

  // Non-blocking provider health check on startup
  AIProviderFactory.healthCheck().then((healthy) => {
    if (healthy) {
      logger.info(
        `✅  AI Provider [${env.AI_PROVIDER}] is reachable and ready`
      );
    } else {
      logger.warn(
        `⚠️  AI Provider [${env.AI_PROVIDER}] health check failed. ` +
        "Voice synthesis will not work until the provider is reachable."
      );
    }
  }).catch((err: Error) => {
    logger.warn(`⚠️  AI Provider health check error: ${err.message}`);
  });

  // Start background queue workers
  EmailWorker.start();

  app.listen(env.PORT, () => {
    logger.info(`🚀  Server initialized successfully on Port ${env.PORT}`);
    logger.info(`📚  Swagger API Documentation at http://localhost:${env.PORT}/api-docs`);
    logger.info(`🤖  Active AI Provider: ${env.AI_PROVIDER}`);
  });
}

bootstrap();
