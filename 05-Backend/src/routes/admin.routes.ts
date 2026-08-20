import { Router } from "express";
import {
  getAdminOverview,
  getAdminUsers,
  getAdminUserDetails,
  updateAdminUserStatus,
  updateAdminUserPlan,
  deleteAdminUser,
  getAdminVoices,
  addAdminVoice,
  updateAdminVoice,
  deleteAdminVoice
} from "../controllers/admin.controller";
import { getSettings, updateSettings } from "../controllers/settings.controller";
import { getTickets, updateTicket } from "../controllers/ticket.controller";
import { protect, adminOnly } from "../middlewares/auth.middleware";

const router = Router();

// Users
router.get("/overview", protect, adminOnly, getAdminOverview);
router.get("/users", protect, adminOnly, getAdminUsers);
router.get("/users/:id", protect, adminOnly, getAdminUserDetails);
router.put("/users/:id/status", protect, adminOnly, updateAdminUserStatus);
router.put("/users/:id/plan", protect, adminOnly, updateAdminUserPlan);
router.delete("/users/:id", protect, adminOnly, deleteAdminUser);

// Settings
router.get("/settings", protect, adminOnly, getSettings);
router.put("/settings", protect, adminOnly, updateSettings);

// Tickets
router.get("/tickets", protect, adminOnly, getTickets);
router.put("/tickets/:id", protect, adminOnly, updateTicket);

// Voices
router.get("/voices", protect, adminOnly, getAdminVoices);
router.post("/voices", protect, adminOnly, addAdminVoice);
router.put("/voices/:id", protect, adminOnly, updateAdminVoice);
router.delete("/voices/:id", protect, adminOnly, deleteAdminVoice);

export default router;
