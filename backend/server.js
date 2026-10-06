import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { initReminderCron, stopReminderCron } from './cron/reminderJob.js';
import mongoose from 'mongoose';

let server;

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Initialize Reminder Cron Job
    initReminderCron();

    // 3. Start HTTP Server
    server = app.listen(env.PORT, () => {
      console.log(`\n=================================================`);
      console.log(`  RemindX Backend API running on port ${env.PORT}`);
      console.log(`  Environment: ${env.NODE_ENV}`);
      console.log(`  Database: ${env.MONGO_URI}`);
      console.log(`=================================================\n`);
    });
  } catch (error) {
    console.error('Fatal Server Startup Error:', error);
    process.exit(1);
  }
};

// Graceful Shutdown
const handleExit = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);
  stopReminderCron();

  if (server) {
    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      await mongoose.connection.close(false);
      console.log('[MongoDB] Connection closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => handleExit('SIGTERM'));
process.on('SIGINT', () => handleExit('SIGINT'));

startServer();

