import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";
import { Event } from "../models/Event.js";
import { Notification } from "../models/Notification.js";
import { processReminders } from "../services/reminderService.js";
import mongoose from "mongoose";

async function addTelegramTestDocs() {
  try {
    await connectDB();
    console.log("[TestDocs] Connected to MongoDB");

    // Enable Telegram alerts for Admin and Bala
    const users = await User.find({ email: { $in: ["admin@gmail.com", "bala@gmail.com"] } });
    
    for (const user of users) {
      user.telegramChatId = "1730876541";
      user.telegramAlertsEnabled = true;
      user.telegramConnectedAt = new Date();
      await user.save();
      console.log(`[TestDocs] Updated user ${user.name} (${user.email}) -> Telegram Chat ID: 1730876541, Alerts Enabled: true`);
    }

    const targetUser = users.find((u) => u.email === "admin@gmail.com") || users[0];
    const secondaryUser = users.find((u) => u.email === "bala@gmail.com");

    const now = new Date();
    // Document 1: Due Today (0 days remaining)
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0);
    // Document 2: Due Tomorrow (1 day remaining)
    const tomorrowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 12, 0, 0);

    // Delete previous test events & notifications for these titles
    const testTitles = ["Passport Renewal Verification", "Vehicle Insurance Policy Renew"];
    const existingEvents = await Event.find({ title: { $in: testTitles } });
    const existingEventIds = existingEvents.map((e) => e._id);

    await Notification.deleteMany({ eventId: { $in: existingEventIds } });
    await Event.deleteMany({ title: { $in: testTitles } });

    // Create 2 test documents for Admin
    const doc1 = await Event.create({
      userId: targetUser._id,
      title: "Passport Renewal Verification",
      description: "Urgent biometric slot verification and passport re-issue deadline.",
      eventDate: todayDate,
      category: "DOCUMENT",
      priority: "URGENT",
      status: "DUE_TODAY",
      reminderSent: false,
      dueNotificationSent: false,
      expiredNotificationSent: false,
    });

    const doc2 = await Event.create({
      userId: targetUser._id,
      title: "Vehicle Insurance Policy Renew",
      description: "Annual comprehensive motor insurance policy renewal deadline.",
      eventDate: tomorrowDate,
      category: "INSURANCE",
      priority: "HIGH",
      status: "DUE_SOON",
      reminderSent: false,
      dueNotificationSent: false,
      expiredNotificationSent: false,
    });

    console.log(`\n[TestDocs] Created 2 Test Documents for ${targetUser.name}:`);
    console.log(`  📄 1. "${doc1.title}" (Category: ${doc1.category}, Priority: ${doc1.priority}, Status: DUE_TODAY)`);
    console.log(`  📄 2. "${doc2.title}" (Category: ${doc2.category}, Priority: ${doc2.priority}, Status: DUE_SOON - Expires Tomorrow)`);

    // Also add 2 test documents for Bala if present
    if (secondaryUser && secondaryUser._id.toString() !== targetUser._id.toString()) {
      await Event.create({
        userId: secondaryUser._id,
        title: "Passport Renewal Verification",
        description: "Urgent biometric slot verification and passport re-issue deadline.",
        eventDate: todayDate,
        category: "DOCUMENT",
        priority: "URGENT",
        status: "DUE_TODAY",
        reminderSent: false,
        dueNotificationSent: false,
        expiredNotificationSent: false,
      });

      await Event.create({
        userId: secondaryUser._id,
        title: "Vehicle Insurance Policy Renew",
        description: "Annual comprehensive motor insurance policy renewal deadline.",
        eventDate: tomorrowDate,
        category: "INSURANCE",
        priority: "HIGH",
        status: "DUE_SOON",
        reminderSent: false,
        dueNotificationSent: false,
        expiredNotificationSent: false,
      });
    }

    // Now run reminder scanner to trigger notifications and live Telegram bot dispatches
    console.log("\n[TestDocs] 🚀 Dispatching live alerts to Telegram Bot (@RemindXAlertsBot)...");
    const scanResult = await processReminders();
    console.log("\n[TestDocs] Scan Summary:", JSON.stringify(scanResult, null, 2));

    // Verify notifications saved in DB
    const notifs = await Notification.find({ eventId: { $in: [doc1._id, doc2._id] } });
    console.log("\n[TestDocs] Notification Logs in Database:");
    notifs.forEach((n) => {
      console.log(`  • Title: "${n.title}" | Telegram Sent: ${n.telegramSent} | Email Sent: ${n.emailSent}`);
    });

    console.log("\n✅ Test documents and Telegram bot notifications completed!");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("[TestDocs] Error:", error);
    process.exit(1);
  }
}

addTelegramTestDocs();
