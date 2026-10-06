import axios from 'axios';

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }
  // Fallback in production build to live Render backend
  if (import.meta.env.PROD) {
    return 'https://remindx-backend.onrender.com/api';
  }
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('remindx_token') || localStorage.getItem('remindx_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('remindx_token');
        localStorage.removeItem('remindx_user');
        localStorage.removeItem('remindx_admin_token');
        localStorage.removeItem('remindx_admin_user');
      }
      const msg = error.response.data?.message || 'Request failed';
      return Promise.reject(new Error(msg));
    }
    if (error.code === 'ECONNABORTED' || !error.response) {
      return Promise.reject(new Error('Backend server is starting up or unreachable. Please retry in 10-15 seconds.'));
    }
    return Promise.reject(error);
  }
);

export default api;

