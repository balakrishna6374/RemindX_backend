import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";
import { Event } from "../models/Event.js";
import { Notification } from "../models/Notification.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

async function seedCleanData() {
  try {
    await connectDB();
    console.log("[Seed] Connected to MongoDB");

    // 1. Remove all users except admin@certialert.com and bala@gmail.com
    const nonTargetUsers = await User.find({
      email: { $nin: ["admin@certialert.com", "bala@gmail.com"] },
    });
    const nonTargetIds = nonTargetUsers.map((u) => u._id);

    if (nonTargetIds.length > 0) {
      await Event.deleteMany({ userId: { $in: nonTargetIds } });
      await Notification.deleteMany({ userId: { $in: nonTargetIds } });
      await User.deleteMany({ _id: { $in: nonTargetIds } });
      console.log(`[Seed] Removed ${nonTargetIds.length} dummy users and associated records.`);
    }

    // 2. Ensure bala@gmail.com exists
    let bala = await User.findOne({ email: "bala@gmail.com" });
    if (!bala) {
      const hashedPassword = await bcrypt.hash("Bala@123456", 12);
      bala = await User.create({
        name: "Balakrishnan S",
        email: "bala@gmail.com",
        password: hashedPassword,
        role: "user",
        isActive: true,
      });
      console.log("[Seed] Created user: bala@gmail.com");
    } else {
      console.log("[Seed] User bala@gmail.com found.");
    }

    // 3. Clear events for bala@gmail.com and re-seed clean realistic certificates
    await Event.deleteMany({ userId: bala._id });
    await Notification.deleteMany({ userId: bala._id });

    const today = new Date();
    const addDays = (d, n) => {
      const date = new Date(d);
      date.setDate(date.getDate() + n);
      return date;
    };

    const realisticEvents = [
      {
        userId: bala._id,
        title: "Income Certificate",
        description: "Annual family income certificate renewal for tax assessment",
        eventDate: addDays(today, 0), // DUE_TODAY
        category: "GOVERNMENT",
        priority: "HIGH",
        status: "DUE_TODAY",
      },
      {
        userId: bala._id,
        title: "Community Certificate",
        description: "Permanent caste & community certificate verification",
        eventDate: addDays(today, 1), // DUE_SOON (tomorrow)
        category: "GOVERNMENT",
        priority: "HIGH",
        status: "DUE_SOON",
      },
      {
        userId: bala._id,
        title: "Driving License",
        description: "Four wheeler and two wheeler transport license renewal",
        eventDate: addDays(today, 3), // DUE_SOON
        category: "LICENSE",
        priority: "URGENT",
        status: "DUE_SOON",
      },
      {
        userId: bala._id,
        title: "Passport Renewal",
        description: "Republic of India 36-page passport validity extension",
        eventDate: addDays(today, 45), // UPCOMING
        category: "DOCUMENT",
        priority: "MEDIUM",
        status: "UPCOMING",
      },
      {
        userId: bala._id,
        title: "Vehicle Insurance Policy",
        description: "Comprehensive car insurance annual premium payment",
        eventDate: addDays(today, 18), // UPCOMING
        category: "INSURANCE",
        priority: "HIGH",
        status: "UPCOMING",
      },
      {
        userId: bala._id,
        title: "Broadband Subscription",
        description: "Fiber internet connection monthly billing cycle",
        eventDate: addDays(today, -2), // EXPIRED
        category: "SUBSCRIPTION",
        priority: "LOW",
        status: "EXPIRED",
      },
    ];

    const insertedEvents = await Event.insertMany(realisticEvents);
    console.log(`[Seed] Created ${insertedEvents.length} real certificates for bala@gmail.com`);

    // Create notifications
    const notifs = [
      {
        userId: bala._id,
        eventId: insertedEvents[0]._id,
        type: "DUE_TODAY",
        title: "Action Required: Income Certificate Expires Today",
        message: "Your Income Certificate is scheduled to expire today. Please complete renewal.",
        isRead: false,
      },
      {
        userId: bala._id,
        eventId: insertedEvents[1]._id,
        type: "REMINDER",
        title: "Reminder: Community Certificate Expires Tomorrow",
        message: "Your Community Certificate will expire tomorrow. Please review renewal status.",
        isRead: false,
      },
      {
        userId: bala._id,
        eventId: insertedEvents[2]._id,
        type: "REMINDER",
        title: "Reminder: Driving License Due in 3 Days",
        message: "Your Driving License renewal deadline is approaching in 3 days.",
        isRead: true,
      },
      {
        userId: bala._id,
        eventId: insertedEvents[5]._id,
        type: "EXPIRED",
        title: "Notice: Broadband Subscription Has Expired",
        message: "Your Broadband Subscription expired 2 days ago.",
        isRead: true,
      },
    ];

    await Notification.insertMany(notifs);
    console.log(`[Seed] Created ${notifs.length} real notification logs.`);

    console.log("[Seed] Database cleanup completed successfully!");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("[Seed] Error:", error);
    process.exit(1);
  }
}

seedCleanData();
