import api from './api';

export const userService = {
  getEvents: async (params = {}) => {
    return api.get('/events', { params });
  },
  getEventSummary: async () => {
    const res = await api.get('/events/summary');
    return res.data;
  },
  getEventById: async (id) => {
    const res = await api.get(`/events/${id}`);
    return res.data;
  },
  createEvent: async (data) => {
    const res = await api.post('/events', data);
    return res.data;
  },
  updateEvent: async (id, data) => {
    const res = await api.put(`/events/${id}`, data);
    return res.data;
  },
  deleteEvent: async (id) => {
    const res = await api.delete(`/events/${id}`);
    return res.data;
  },
  getNotifications: async (params = {}) => {
    const res = await api.get('/notifications', { params });
    return res.data;
  },
  getUnreadNotificationsCount: async () => {
    const res = await api.get('/notifications/unread-count');
    return res.data;
  },
  markNotificationRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },
  markAllNotificationsRead: async () => {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },
};

export default userService;

