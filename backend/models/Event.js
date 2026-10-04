import mongoose from "mongoose";
import { getDaysRemaining, getEventStatus } from "../utils/dateUtils.js";

const eventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    eventDate: { type: Date, required: true, index: true },
    category: { type: String, default: "OTHER", index: true },
    priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "URGENT"], default: "MEDIUM" },
    status: { type: String, enum: ["UPCOMING", "DUE_SOON", "DUE_TODAY", "EXPIRED"], default: "UPCOMING", index: true },
    reminderSent: { type: Boolean, default: false },
    reminderSentAt: { type: Date },
    dueNotificationSent: { type: Boolean, default: false },
    dueNotificationSentAt: { type: Date },
    expiredNotificationSent: { type: Boolean, default: false },
    expiredNotificationSentAt: { type: Date },
  },
  { timestamps: true }
);

eventSchema.pre("save", function (next) {
  if (this.eventDate) this.status = getEventStatus(this.eventDate);
  next();
});

eventSchema.index({ userId: 1, eventDate: 1 });
export const Event = mongoose.model("Event", eventSchema);
