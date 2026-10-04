import cron from "node-cron";
import { env } from "../config/env.js";
import { processReminders } from "../services/reminderService.js";

let cronTask = null;
export const initReminderCron = () => {
  const schedule = env.CRON_SCHEDULE || "0 8 * * *";
  console.log(`[Cron] Initializing reminder cron (${schedule})`);
  cronTask = cron.schedule(schedule, async () => {
    try { await processReminders(); } catch (err) { console.error("Cron error:", err); }
  });
  return cronTask;
};
export const stopReminderCron = () => { if (cronTask) cronTask.stop(); };
