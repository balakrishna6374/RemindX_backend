import { Event } from "../models/Event.js";
import { Notification } from "../models/Notification.js";
import { sendSuccess, sendError } from "../utils/responseUtils.js";
import { getEventStatus, getDaysRemaining } from "../utils/dateUtils.js";

export const getEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, category, priority, status } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;
    const query = { userId: req.user._id };
    if (search) {
      query.$or = [{ title: { $regex: search.trim(), $options: "i" } }, { description: { $regex: search.trim(), $options: "i" } }];
    }
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (status) query.status = status;
    const [total, events] = await Promise.all([
      Event.countDocuments(query),
      Event.find(query).sort({ eventDate: 1 }).skip(skip).limit(limitNum),
    ]);
    const formatted = events.map((e) => ({
      ...e.toObject(),
      status: getEventStatus(e.eventDate),
      daysRemaining: getDaysRemaining(e.eventDate),
    }));
    return sendSuccess(res, 200, "Events retrieved", formatted, {
      total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) { next(error); }
};

export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, userId: req.user._id });
    if (!event) return sendError(res, 404, "Event not found");
    return sendSuccess(res, 200, "Event details", {
      ...event.toObject(),
      status: getEventStatus(event.eventDate),
      daysRemaining: getDaysRemaining(event.eventDate),
    });
  } catch (error) { next(error); }
};

export const createEvent = async (req, res, next) => {
  try {
    const { title, description, eventDate, category, priority } = req.body;
    const parsedDate = new Date(eventDate);
    const event = await Event.create({
      userId: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : "",
      eventDate: parsedDate,
      category: category || "OTHER",
      priority: priority || "MEDIUM",
      status: getEventStatus(parsedDate),
    });
    return sendSuccess(res, 201, "Event created", {
      ...event.toObject(),
      status: getEventStatus(event.eventDate),
      daysRemaining: getDaysRemaining(event.eventDate),
    });
  } catch (error) { next(error); }
};

export const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, userId: req.user._id });
    if (!event) return sendError(res, 404, "Event not found");
    const { title, description, eventDate, category, priority } = req.body;
    if (title !== undefined) event.title = title.trim();
    if (description !== undefined) event.description = description.trim();
    if (category !== undefined) event.category = category;
    if (priority !== undefined) event.priority = priority;
    if (eventDate !== undefined) {
      event.eventDate = new Date(eventDate);
      event.status = getEventStatus(event.eventDate);
    }
    await event.save();
    return sendSuccess(res, 200, "Event updated", {
      ...event.toObject(),
      status: getEventStatus(event.eventDate),
      daysRemaining: getDaysRemaining(event.eventDate),
    });
  } catch (error) { next(error); }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!event) return sendError(res, 404, "Event not found");
    await Notification.deleteMany({ eventId: event._id });
    return sendSuccess(res, 200, "Event deleted");
  } catch (error) { next(error); }
};

export const getEventSummary = async (req, res, next) => {
  try {
    const events = await Event.find({ userId: req.user._id });
    const summary = { total: events.length, upcoming: 0, dueSoon: 0, dueToday: 0, expired: 0 };
    events.forEach((e) => {
      const s = getEventStatus(e.eventDate);
      if (s === "UPCOMING") summary.upcoming++;
      else if (s === "DUE_SOON") summary.dueSoon++;
      else if (s === "DUE_TODAY") summary.dueToday++;
      else if (s === "EXPIRED") summary.expired++;
    });
    return sendSuccess(res, 200, "Event summary", summary);
  } catch (error) { next(error); }
};
