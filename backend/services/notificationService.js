import { Notification } from "../models/Notification.js";
import { sendReminderEmail, sendDueTodayEmail, sendExpiredEmail } from "./emailService.js";
import { sendReminderAlert } from "./telegramService.js";
import { formatDateDisplay } from "../utils/dateUtils.js";

export const createNotification = async ({
  userId,
  eventId = null,
  type,
  title,
  message,
  user = null,
  event = null,
  force = false,
}) => {
  try {
    if (eventId && !force) {
      const existing = await Notification.findOne({ userId, eventId, type });
      if (existing) return { created: false, notification: existing, reason: "DUPLICATE_PREVENTED" };
    }

    const notification = new Notification({ userId, eventId, type, title, message, isRead: false });

    // 1. Email Channel Dispatch
    if (user && user.email && user.emailAlertsEnabled !== false) {
      let emailResult = null;
      const formattedDate = event?.eventDate ? formatDateDisplay(event.eventDate) : "";
      if (type === "REMINDER") {
        emailResult = await sendReminderEmail({
          to: user.email,
          userName: user.name,
          eventTitle: event?.title || title,
          eventDateFormatted: formattedDate,
          category: event?.category || "OTHER",
          daysRemaining: 1,
        });
      } else if (type === "DUE_TODAY") {
        emailResult = await sendDueTodayEmail({
          to: user.email,
          userName: user.name,
          eventTitle: event?.title || title,
          eventDateFormatted: formattedDate,
          category: event?.category || "OTHER",
        });
      } else if (type === "EXPIRED") {
        emailResult = await sendExpiredEmail({
          to: user.email,
          userName: user.name,
          eventTitle: event?.title || title,
          eventDateFormatted: formattedDate,
          category: event?.category || "OTHER",
        });
      }

      if (emailResult) {
        if (emailResult.success) {
          notification.emailSent = true;
          notification.emailSentAt = new Date();
        } else {
          notification.emailSent = false;
          notification.emailError = emailResult.error;
        }
      }
    }

    // 2. Telegram Bot Channel Dispatch
    if (user && user.telegramChatId && user.telegramAlertsEnabled !== false) {
      try {
        const tgResult = await sendReminderAlert({
          chatId: user.telegramChatId,
          user,
          event,
          type,
          daysRemaining: type === "REMINDER" ? 1 : type === "DUE_TODAY" ? 0 : -1,
        });

        if (tgResult && tgResult.success) {
          notification.telegramSent = true;
          notification.telegramSentAt = new Date();
        } else if (tgResult && !tgResult.success) {
          notification.telegramSent = false;
          notification.telegramError = tgResult.error;
        }
      } catch (tgErr) {
        console.warn("[NotificationService] Telegram dispatch error:", tgErr.message);
        notification.telegramSent = false;
        notification.telegramError = tgErr.message;
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

export default { createNotification };
