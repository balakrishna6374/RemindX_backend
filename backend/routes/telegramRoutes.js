import { Router } from 'express';
import {
  getTelegramStatus,
  connectTelegram,
  sendTestAlert,
  disconnectTelegram,
  toggleTelegramAlerts,
  autoDetectTelegramChatId,
} from '../controllers/telegramController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all telegram routes with JWT authentication
router.use(authenticate);

router.get('/status', getTelegramStatus);
router.get('/auto-detect', autoDetectTelegramChatId);
router.post('/connect', connectTelegram);
router.post('/test', sendTestAlert);
router.post('/disconnect', disconnectTelegram);
router.patch('/toggle', toggleTelegramAlerts);

export default router;
