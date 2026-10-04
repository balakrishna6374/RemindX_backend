import { Notification } from "../models/Notification.js";
import { sendSuccess, sendError } from "../utils/responseUtils.js";

export const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, isRead, type } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;
    const query = { userId: req.user._id };
    if (isRead !== undefined) query.isRead = isRead === "true" || isRead === true;
    if (type) query.type = type;
    const [total, notifs] = await Promise.all([
      Notification.countDocuments(query),
      Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    ]);
    return sendSuccess(res, 200, "Notifications retrieved", notifs, {
      total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) { next(error); }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });
    return sendSuccess(res, 200, "Unread count", { unreadCount });
  } catch (error) { next(error); }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notif = await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isRead: true }, { new: true });
    if (!notif) return sendError(res, 404, "Notification not found");
    return sendSuccess(res, 200, "Notification read", notif);
  } catch (error) { next(error); }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const resUpdate = await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    return sendSuccess(res, 200, "All notifications read", { modifiedCount: resUpdate.modifiedCount });
  } catch (error) { next(error); }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const notif = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!notif) return sendError(res, 404, "Notification not found");
    return sendSuccess(res, 200, "Notification deleted");
  } catch (error) { next(error); }
};
