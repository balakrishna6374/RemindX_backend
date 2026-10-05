import api from './api';

export const adminService = {
  getDashboardStats: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },
  getUsers: async (params = {}) => {
    return api.get('/admin/users', { params });
  },
  getUserDetails: async (id) => {
    const res = await api.get(`/admin/users/${id}`);
    return res.data;
  },
  updateUser: async (id, data) => {
    const res = await api.patch(`/admin/users/${id}`, data);
    return res.data;
  },
  deleteUser: async (id) => {
    return api.delete(`/admin/users/${id}`);
  },
  getEvents: async (params = {}) => {
    return api.get('/admin/events', { params });
  },
  deleteEvent: async (id) => {
    return api.delete(`/admin/events/${id}`);
  },
  getNotifications: async (params = {}) => {
    return api.get('/admin/notifications', { params });
  },
  triggerReminders: async () => {
    const res = await api.post('/admin/trigger-reminders');
    return res.data;
  },
  dispatchAlert: async (eventId) => {
    const res = await api.post(`/events/${eventId}/dispatch`);
    return res.data;
  },
};
