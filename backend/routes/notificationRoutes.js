import { Router } from "express";
import {
  getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification,
  manualScanAndDispatch, getNotificationSettings, updateNotificationSettings
} from "../controllers/notificationController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();
router.use(authenticate);
router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.get("/settings", getNotificationSettings);
router.patch("/settings", updateNotificationSettings);
router.post("/manual-scan", manualScanAndDispatch);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);
export default router;
