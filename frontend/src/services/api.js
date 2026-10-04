import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('certialert_token') || localStorage.getItem('certialert_admin_token');
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
        localStorage.removeItem('certialert_token');
        localStorage.removeItem('certialert_user');
        localStorage.removeItem('certialert_admin_token');
        localStorage.removeItem('certialert_admin_user');
      }
      const msg = error.response.data?.message || 'Request failed';
      return Promise.reject(new Error(msg));
    }
    return Promise.reject(error);
  }
);

export default api;
