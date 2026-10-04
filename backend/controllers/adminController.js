import { User } from "../models/User.js";
import { Event } from "../models/Event.js";
import { Notification } from "../models/Notification.js";
import { sendSuccess, sendError } from "../utils/responseUtils.js";
import { getEventStatus, getDaysRemaining } from "../utils/dateUtils.js";
import { processReminders } from "../services/reminderService.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers, activeUsers, inactiveUsers, totalEvents, allEvents, totalNotifications, unreadNotifications, recentUsers, recentEvents, recentNotifications
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "user", isActive: true }),
      User.countDocuments({ role: "user", isActive: false }),
      Event.countDocuments(),
      Event.find().select("eventDate category priority status"),
      Notification.countDocuments(),
      Notification.countDocuments({ isRead: false }),
      User.find({ role: "user" }).sort({ createdAt: -1 }).limit(5),
      Event.find().populate("userId", "name email").sort({ createdAt: -1 }).limit(5),
      Notification.find().populate("userId", "name email").sort({ createdAt: -1 }).limit(5),
    ]);

    let upcomingEvents = 0;
    let dueSoonEvents = 0;
    let dueToday = 0;
    let expiredEvents = 0;
    const categoryDistribution = {};
    const priorityDistribution = {};

    allEvents.forEach((ev) => {
      const status = getEventStatus(ev.eventDate);
      if (status === "UPCOMING") upcomingEvents++;
      else if (status === "DUE_SOON") dueSoonEvents++;
      else if (status === "DUE_TODAY") dueToday++;
      else if (status === "EXPIRED") expiredEvents++;

      const cat = ev.category || "OTHER";
      categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;
      const pri = ev.priority || "MEDIUM";
      priorityDistribution[pri] = (priorityDistribution[pri] || 0) + 1;
    });

    return sendSuccess(res, 200, "Dashboard statistics", {
      users: { totalUsers, activeUsers, inactiveUsers },
      events: { totalEvents, upcomingEvents, dueSoonEvents, dueToday, expiredEvents },
      notifications: { totalNotifications, unreadNotifications },
      distributions: { byCategory: categoryDistribution, byPriority: priorityDistribution },
      recent: {
        users: recentUsers,
        events: recentEvents.map((e) => ({
          ...e.toObject(),
          status: getEventStatus(e.eventDate),
          daysRemaining: getDaysRemaining(e.eventDate),
        })),
        notifications: recentNotifications,
      },
    });
  } catch (error) { next(error); }
};

export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status, role } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;
    const query = {};
    if (search) {
      query.$or = [{ name: { $regex: search.trim(), $options: "i" } }, { email: { $regex: search.trim(), $options: "i" } }];
    }
    if (status !== undefined && status !== "") query.isActive = status === "active" || status === "true";
    if (role) query.role = role;
    const [total, users] = await Promise.all([
      User.countDocuments(query),
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    ]);
    const userIds = users.map((u) => u._id);
    const eventCounts = await Event.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: "$userId", count: { $sum: 1 } } },
    ]);
    const countMap = {};
    eventCounts.forEach((item) => { countMap[item._id.toString()] = item.count; });
    const formatted = users.map((u) => ({
      ...u.toObject(),
      eventCount: countMap[u._id.toString()] || 0,
    }));
    return sendSuccess(res, 200, "Users retrieved", formatted, {
      total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) { next(error); }
};

export const getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 404, "User not found");
    const [events, notifications] = await Promise.all([
      Event.find({ userId: user._id }).sort({ eventDate: 1 }),
      Notification.find({ userId: user._id }).sort({ createdAt: -1 }).limit(20),
    ]);
    return sendSuccess(res, 200, "User details", {
      user,
      events: events.map((e) => ({
        ...e.toObject(),
        status: getEventStatus(e.eventDate),
        daysRemaining: getDaysRemaining(e.eventDate),
      })),
      notifications,
    });
  } catch (error) { next(error); }
};

export const updateUser = async (req, res, next) => {
  try {
    const { name, isActive, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 404, "User not found");
    if (user._id.toString() === req.user._id.toString()) {
      if (isActive === false) return sendError(res, 400, "Cannot deactivate own admin account");
      if (role && role !== "admin") return sendError(res, 400, "Cannot revoke own admin role");
    }
    if (name !== undefined) user.name = name.trim();
    if (isActive !== undefined) user.isActive = isActive;
    if (role !== undefined) user.role = role;
    await user.save();
    return sendSuccess(res, 200, "User updated", user);
  } catch (error) { next(error); }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 404, "User not found");
    if (user._id.toString() === req.user._id.toString()) return sendError(res, 400, "Cannot delete own admin account");
    await Promise.all([
      User.deleteOne({ _id: user._id }),
      Event.deleteMany({ userId: user._id }),
      Notification.deleteMany({ userId: user._id }),
    ]);
    return sendSuccess(res, 200, "User deleted");
  } catch (error) { next(error); }
};

export const getAllEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status, category, priority, userId } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;
    const query = {};
    if (userId) query.userId = userId;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (status) query.status = status;
    if (search) {
      query.$or = [{ title: { $regex: search.trim(), $options: "i" } }, { description: { $regex: search.trim(), $options: "i" } }];
    }
    const [total, events] = await Promise.all([
      Event.countDocuments(query),
      Event.find(query).populate("userId", "name email isActive").sort({ eventDate: 1 }).skip(skip).limit(limitNum),
    ]);
    return sendSuccess(res, 200, "Admin events", events.map((e) => ({
      ...e.toObject(),
      status: getEventStatus(e.eventDate),
      daysRemaining: getDaysRemaining(e.eventDate),
    })), {
      total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) { next(error); }
};

export const deleteEventAdmin = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return sendError(res, 404, "Event not found");
    await Notification.deleteMany({ eventId: event._id });
    return sendSuccess(res, 200, "Event removed by admin");
  } catch (error) { next(error); }
};

export const getAllNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, isRead } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;
    const query = {};
    if (type) query.type = type;
    if (isRead !== undefined && isRead !== "") query.isRead = isRead === "true" || isRead === true;
    const [total, notifs] = await Promise.all([
      Notification.countDocuments(query),
      Notification.find(query).populate("userId", "name email").sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    ]);
    return sendSuccess(res, 200, "Admin notifications", notifs, {
      total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) { next(error); }
};

export const triggerReminderJob = async (req, res, next) => {
  try {
    const result = await processReminders();
    return sendSuccess(res, 200, "Reminder pipeline executed", result);
  } catch (error) { next(error); }
};
