import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import projectRoutes from "./project.routes";
import voiceRoutes from "./voice.routes";
import generationRoutes from "./generation.routes";
import elevenLabsRoutes from "./elevenlabs.routes";
import subscriptionRoutes from "./subscription.routes";
import stripeRoutes from "./stripe.routes";
import analyticsRoutes from "./analytics.routes";
import paymentRoutes from "./payment.routes";
import adminRoutes from "./admin.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/projects", projectRoutes);
router.use("/voices", voiceRoutes);
router.use("/voice-generations", generationRoutes);
router.use("/payments", paymentRoutes);
router.use("/elevenlabs", elevenLabsRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/stripe", stripeRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/admin", adminRoutes);

export default router;


