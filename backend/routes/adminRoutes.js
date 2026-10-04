import { Router } from "express";
import {
  getDashboardStats, getUsers, getUserDetails, updateUser, deleteUser,
  getAllEvents, deleteEventAdmin, getAllNotifications, triggerReminderJob
} from "../controllers/adminController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";
import { validateBody } from "../middleware/validationMiddleware.js";
import { adminUpdateUserSchema } from "../validators/userValidator.js";

const router = Router();
router.use(authenticate, requireAdmin);
router.get("/dashboard", getDashboardStats);
router.get("/users", getUsers);
router.get("/users/:id", getUserDetails);
router.patch("/users/:id", validateBody(adminUpdateUserSchema), updateUser);
router.delete("/users/:id", deleteUser);
router.get("/events", getAllEvents);
router.delete("/events/:id", deleteEventAdmin);
router.get("/notifications", getAllNotifications);
router.post("/trigger-reminders", triggerReminderJob);
export default router;
