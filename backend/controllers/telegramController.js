import { User } from '../models/User.js';
import {
  isTelegramConfigured,
  getTelegramBotInfo,
  sendWelcomeMessage,
  sendTestMessage,
  getLatestTelegramUpdate,
} from '../services/telegramService.js';
import { env } from '../config/env.js';

/**
 * Auto-detect user Chat ID from recent messages sent to the bot
 */
export const autoDetectTelegramChatId = async (req, res, next) => {
  try {
    const result = await getLatestTelegramUpdate();
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'No recent messages found from your Telegram account.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Telegram Chat ID detected successfully!',
      data: {
        chatId: result.chatId,
        username: result.username,
        firstName: result.firstName,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get current user Telegram connection status and bot details
 */
export const getTelegramStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const botInfo = await getTelegramBotInfo();

    res.status(200).json({
      success: true,
      data: {
        isConfigured: botInfo.configured,
        botUsername: botInfo.botUsername || env.TELEGRAM_BOT_USERNAME || 'RemindXAlertsBot',
        botName: botInfo.botName || 'RemindX Alerts',
        isConnected: Boolean(user?.telegramChatId),
        telegramChatId: user?.telegramChatId || null,
        telegramUsername: user?.telegramUsername || null,
        telegramConnectedAt: user?.telegramConnectedAt || null,
        telegramAlertsEnabled: user?.telegramAlertsEnabled ?? true,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Connect user Telegram Chat ID
 */
export const connectTelegram = async (req, res, next) => {
  try {
    const { chatId, username } = req.body;

    if (!chatId || !String(chatId).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Telegram Chat ID is required.',
      });
    }

    const cleanChatId = String(chatId).trim();
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    user.telegramChatId = cleanChatId;
    user.telegramUsername = username ? String(username).replace('@', '').trim() : null;
    user.telegramConnectedAt = new Date();
    user.telegramAlertsEnabled = true;
    await user.save();

    // Send instant welcome message to the connected Telegram chat
    const sendResult = await sendWelcomeMessage(cleanChatId, user.name);

    res.status(200).json({
      success: true,
      message: 'Telegram alerts linked successfully!',
      data: {
        isConnected: true,
        telegramChatId: user.telegramChatId,
        telegramUsername: user.telegramUsername,
        telegramConnectedAt: user.telegramConnectedAt,
        telegramAlertsEnabled: user.telegramAlertsEnabled,
        dispatchResult: sendResult,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Send a live test alert to the connected Telegram chat
 */
export const sendTestAlert = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || !user.telegramChatId) {
      return res.status(400).json({
        success: false,
        message: 'Please link your Telegram Chat ID first before sending a test alert.',
      });
    }

    const result = await sendTestMessage(user.telegramChatId, user.name);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to dispatch test alert to Telegram.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Test notification sent to Telegram successfully!',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Disconnect Telegram integration
 */
export const disconnectTelegram = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.telegramChatId = null;
    user.telegramUsername = null;
    user.telegramConnectedAt = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Telegram alerts disconnected successfully.',
      data: {
        isConnected: false,
        telegramChatId: null,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Toggle Telegram alerts on / off without disconnecting
 */
export const toggleTelegramAlerts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.telegramAlertsEnabled = !user.telegramAlertsEnabled;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Telegram alerts ${user.telegramAlertsEnabled ? 'enabled' : 'paused'}.`,
      data: {
        telegramAlertsEnabled: user.telegramAlertsEnabled,
      },
    });
  } catch (err) {
    next(err);
  }
};
