import api from './api';

export const telegramService = {
  getStatus: async () => {
    const res = await api.get('/telegram/status');
    return res.data;
  },

  autoDetect: async () => {
    const res = await api.get('/telegram/auto-detect');
    return res.data;
  },

  connect: async (chatId, username = '') => {
    const res = await api.post('/telegram/connect', { chatId, username });
    return res.data;
  },

  sendTestAlert: async () => {
    const res = await api.post('/telegram/test');
    return res.data;
  },

  disconnect: async () => {
    const res = await api.post('/telegram/disconnect');
    return res.data;
  },

  toggleAlerts: async () => {
    const res = await api.patch('/telegram/toggle');
    return res.data;
  },
};

export default telegramService;
