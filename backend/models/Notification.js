import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", default: null, index: true },
    type: { type: String, enum: ["REMINDER", "DUE_TODAY", "EXPIRED", "SYSTEM"], required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false, index: true },
    emailSent: { type: Boolean, default: false },
    emailSentAt: { type: Date },
    emailError: { type: String },
    createdAt: { type: Date, default: Date.now, index: true },
  }
);

notificationSchema.index(
  { userId: 1, eventId: 1, type: 1 },
  { unique: true, partialFilterExpression: { eventId: { $type: "objectId" } } }
);

export const Notification = mongoose.model("Notification", notificationSchema);
