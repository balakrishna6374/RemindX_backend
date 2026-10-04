import { Notification } from "../models/Notification.js";
import { sendReminderEmail, sendDueTodayEmail, sendExpiredEmail } from "./emailService.js";
import { formatDateDisplay } from "../utils/dateUtils.js";

export const createNotification = async ({ userId, eventId = null, type, title, message, user = null, event = null }) => {
  try {
    if (eventId) {
      const existing = await Notification.findOne({ userId, eventId, type });
      if (existing) return { created: false, notification: existing, reason: "DUPLICATE_PREVENTED" };
    }
    const notification = new Notification({ userId, eventId, type, title, message, isRead: false });
    if (user && user.email) {
      let emailResult = null;
      const formattedDate = event?.eventDate ? formatDateDisplay(event.eventDate) : "";
      if (type === "REMINDER") emailResult = await sendReminderEmail({ to: user.email, userName: user.name, eventTitle: event?.title || title, eventDateFormatted: formattedDate, category: event?.category || "OTHER", daysRemaining: 1 });
      else if (type === "DUE_TODAY") emailResult = await sendDueTodayEmail({ to: user.email, userName: user.name, eventTitle: event?.title || title, eventDateFormatted: formattedDate, category: event?.category || "OTHER" });
      else if (type === "EXPIRED") emailResult = await sendExpiredEmail({ to: user.email, userName: user.name, eventTitle: event?.title || title, eventDateFormatted: formattedDate, category: event?.category || "OTHER" });
      if (emailResult) {
        if (emailResult.success) { notification.emailSent = true; notification.emailSentAt = new Date(); }
        else { notification.emailSent = false; notification.emailError = emailResult.error; }
      }
    }
    await notification.save();
    return { created: true, notification };
  } catch (error) {
    if (error.code === 11000) {
      const existing = await Notification.findOne({ userId, eventId, type });
      return { created: false, notification: existing, reason: "DUPLICATE_PREVENTED" };
    }
    throw error;
  }
};
