import { Event } from "../models/Event.js";
import { getDaysRemaining, getEventStatus, formatDateDisplay } from "../utils/dateUtils.js";
import { createNotification } from "./notificationService.js";

export const processReminders = async (referenceDate = new Date()) => {
  console.log(`[ReminderService] Scanning events at ${new Date().toISOString()}`);
  const summary = { totalChecked: 0, statusUpdated: 0, remindersSent: 0, dueTodaySent: 0, expiredSent: 0, errors: [] };
  try {
    const events = await Event.find().populate("userId");
    for (const event of events) {
      summary.totalChecked++;
      try {
        const user = event.userId;
        if (!user || !user.isActive) continue;
        const days = getDaysRemaining(event.eventDate, referenceDate);
        const newStatus = getEventStatus(event.eventDate, referenceDate);
        let modified = false;
        if (event.status !== newStatus) { event.status = newStatus; modified = true; summary.statusUpdated++; }
        const dateStr = formatDateDisplay(event.eventDate);

        if (days === 1 && !event.reminderSent) {
          const r = await createNotification({
            userId: user._id, eventId: event._id, type: "REMINDER",
            title: `${event.title} expires tomorrow`,
            message: `Your ${event.title} (${event.category}) expires tomorrow on ${dateStr}.`,
            user, event,
          });
          if (r.created) { event.reminderSent = true; event.reminderSentAt = new Date(); modified = true; summary.remindersSent++; }
        }
        if (days === 0 && !event.dueNotificationSent) {
          const r = await createNotification({
            userId: user._id, eventId: event._id, type: "DUE_TODAY",
            title: `${event.title} expires today`,
            message: `Your ${event.title} (${event.category}) reaches its expiry date today (${dateStr}).`,
            user, event,
          });
          if (r.created) { event.dueNotificationSent = true; event.dueNotificationSentAt = new Date(); modified = true; summary.dueTodaySent++; }
        }
        if (days < 0 && !event.expiredNotificationSent) {
          const r = await createNotification({
            userId: user._id, eventId: event._id, type: "EXPIRED",
            title: `${event.title} has expired`,
            message: `Your ${event.title} (${event.category}) expired on ${dateStr}.`,
            user, event,
          });
          if (r.created) { event.expiredNotificationSent = true; event.expiredNotificationSentAt = new Date(); modified = true; summary.expiredSent++; }
        }
        if (modified) await event.save();
      } catch (err) {
        summary.errors.push({ eventId: event._id, error: err.message });
      }
    }
    return summary;
  } catch (error) {
    summary.errors.push({ critical: error.message });
    return summary;
  }
};
