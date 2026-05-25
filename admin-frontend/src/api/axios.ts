import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_AUTH_SERVICE_URL?.replace('/auth', '') || 'http://localhost:3000',
  withCredentials: true,
  headers: {
    "Bypass-Tunnel-Reminder": "true"
  }
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
