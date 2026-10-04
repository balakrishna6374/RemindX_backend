import nodemailer from "nodemailer";
import { env } from "../config/env.js";

export const sendEmail = async ({ to, subject, html, text }) => {
  console.log(`[Email Dispatch] To: ${to} | Subject: ${subject}`);
  return { success: true, messageId: `msg-${Date.now()}@certialert.local` };
};

export const sendReminderEmail = async (params) => sendEmail({ to: params.to, subject: `Reminder: Your ${params.eventTitle} expires soon`, text: `Expires on ${params.eventDateFormatted}` });
export const sendDueTodayEmail = async (params) => sendEmail({ to: params.to, subject: `Urgent: Your ${params.eventTitle} expires today`, text: `Expires today: ${params.eventDateFormatted}` });
export const sendExpiredEmail = async (params) => sendEmail({ to: params.to, subject: `Notice: Your ${params.eventTitle} has expired`, text: `Expired on ${params.eventDateFormatted}` });
