import { env } from '../config/env.js';

/**
 * Checks if the Telegram Bot Token is configured
 */
export const isTelegramConfigured = () => {
  return Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_BOT_TOKEN.trim().length > 0);
};

/**
 * Retrieves bot information from Telegram API
 */
export const getTelegramBotInfo = async () => {
  if (!isTelegramConfigured()) {
    return {
      configured: false,
      botUsername: env.TELEGRAM_BOT_USERNAME || 'RemindXAlertsBot',
      message: 'Telegram Bot Token not configured in environment variables.',
    };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/getMe`);
    const data = await response.json();
    if (data.ok) {
      return {
        configured: true,
        botUsername: data.result.username,
        botName: data.result.first_name,
        botId: data.result.id,
      };
    }
    return {
      configured: false,
      botUsername: env.TELEGRAM_BOT_USERNAME,
      error: data.description || 'Invalid Telegram Bot Token.',
    };
  } catch (err) {
    return {
      configured: false,
      botUsername: env.TELEGRAM_BOT_USERNAME,
      error: err.message,
    };
  }
};

/**
 * Sends a raw text message to a specific Telegram Chat ID
 */
export const sendTelegramMessage = async (chatId, text, options = {}) => {
  if (!isTelegramConfigured()) {
    console.log(`[TelegramService] Simulation mode: Message to Chat ID ${chatId}: ${text}`);
    return {
      success: true,
      simulated: true,
      message: 'Telegram token not configured; message logged to server output.',
    };
  }

  if (!chatId) {
    return { success: false, error: 'Target Telegram Chat ID is required.' };
  }

  try {
    const payload = {
      chat_id: chatId,
      text: text,
      parse_mode: options.parse_mode || 'HTML',
      disable_web_page_preview: options.disable_web_page_preview ?? true,
      ...(options.reply_markup && { reply_markup: options.reply_markup }),
    };

    const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.ok) {
      return { success: true, messageId: data.result.message_id };
    }

    console.warn(`[TelegramService] Send error: ${data.description}`);
    return { success: false, error: data.description || 'Failed to dispatch Telegram message.' };
  } catch (err) {
    console.error(`[TelegramService] Network error:`, err);
    return { success: false, error: err.message };
  }
};

/**
 * Sends an instant connection confirmation message
 */
export const sendWelcomeMessage = async (chatId, userName = 'Member') => {
  const text = `
🎉 <b>RemindX Telegram Alerts Connected!</b>

Hello <b>${userName}</b>,
Your Telegram account has been successfully linked to <b>RemindX</b>.

🔔 <b>What you will receive:</b>
• ⚠️ <i>Due Soon Reminders</i> (24-48 hours before target expiry)
• 🚨 <i>Due Today Alerts</i> (Instant morning reminder on expiry day)
• ❌ <i>Expired Notice</i> (Notification if a document passes deadline)

<i>You can manage notification preferences at any time inside your RemindX Portal.</i>
`;

  return sendTelegramMessage(chatId, text);
};

/**
 * Sends a test alert message
 */
export const sendTestMessage = async (chatId, userName = 'Member') => {
  const timestamp = new Date().toLocaleString();
  const text = `
⚡ <b>RemindX Dispatch Test Notification</b>

Hello <b>${userName}</b>,
This is a test notification confirming that your RemindX Telegram dispatcher is active and functioning properly!

⏰ <b>Dispatched At:</b> ${timestamp}
🛡️ <b>Status:</b> 🟢 Operational
🔗 <b>Portal:</b> <a href="${env.FRONTEND_URL || 'http://localhost:5173'}">Open RemindX Vault</a>
`;

  return sendTelegramMessage(chatId, text);
};

/**
 * Dispatches an automated expiration reminder to the user's Telegram
 */
export const sendReminderAlert = async ({ chatId, user, event, type, daysRemaining }) => {
  if (!chatId) return { success: false, error: 'No Telegram Chat ID' };

  const eventTitle = event?.title || 'Tracked Document';
  const category = event?.category || 'GENERAL';
  const priority = event?.priority || 'MEDIUM';
  const eventDate = event?.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'N/A';
  const userName = user?.name || 'Member';

  let headerEmoji = '🔔';
  let statusHeadline = 'Upcoming Expiry Reminder';

  if (type === 'DUE_TODAY') {
    headerEmoji = '🚨';
    statusHeadline = 'EXPIRES TODAY - ACTION REQUIRED';
  } else if (type === 'EXPIRED') {
    headerEmoji = '❌';
    statusHeadline = 'DOCUMENT HAS EXPIRED';
  } else if (type === 'REMINDER') {
    headerEmoji = '⚠️';
    statusHeadline = 'EXPIRING TOMORROW';
  }

  const text = `
${headerEmoji} <b>RemindX: ${statusHeadline}</b>

Hello <b>${userName}</b>,

📄 <b>Document:</b> <code>${eventTitle}</code>
🏷️ <b>Category:</b> ${category}
⚡ <b>Priority:</b> ${priority}
📅 <b>Target Expiry Date:</b> <b>${eventDate}</b>

${
  type === 'DUE_TODAY'
    ? '🔥 <b>Attention:</b> This certificate reaches its deadline today. Please complete your renewal.'
    : type === 'EXPIRED'
    ? '⚠️ <b>Notice:</b> This document has passed its renewal date.'
    : `⏳ <b>Time Remaining:</b> ${daysRemaining || 1} day(s) left until expiry.`
}

🌐 <a href="${env.FRONTEND_URL || 'http://localhost:5173'}">Review in RemindX Portal</a>
`;

  return sendTelegramMessage(chatId, text);
};

/**
 * Fetches recent updates from Telegram and automatically extracts the latest Chat ID
 */
export const getLatestTelegramUpdate = async () => {
  if (!isTelegramConfigured()) {
    return {
      success: false,
      configured: false,
      error: 'Telegram Bot Token not configured in backend/.env. Please add TELEGRAM_BOT_TOKEN first.',
    };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/getUpdates?limit=10&offset=-10`);
    const data = await res.json();
    if (!data.ok) {
      return { success: false, error: data.description || 'Failed to fetch updates from Telegram API.' };
    }

    const updates = data.result || [];
    if (updates.length === 0) {
      return {
        success: false,
        error: 'No messages found! Please open your bot in Telegram, click Start (or type /start or send any message), and try again.',
      };
    }

    // Get the most recent update
    const lastUpdate = updates[updates.length - 1];
    const msg = lastUpdate.message || lastUpdate.edited_message || lastUpdate.channel_post;

    if (!msg || !msg.chat) {
      return { success: false, error: 'Could not extract chat details from the most recent update.' };
    }

    const chatId = String(msg.chat.id);
    const username = msg.chat.username || msg.from?.username || '';
    const firstName = msg.chat.first_name || msg.from?.first_name || 'there';

    // Auto reply to the user inside their Telegram chat with their Chat ID
    const replyText = `
👋 <b>Hello ${firstName}!</b>

Your RemindX Telegram Chat ID is:
👉 <code>${chatId}</code> 👈 <i>(Tap to copy)</i>

Paste this ID in your RemindX Portal to activate automatic expiry notifications!
`;
    sendTelegramMessage(chatId, replyText).catch(() => {});

    return {
      success: true,
      chatId,
      username,
      firstName,
      text: msg.text || '',
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
