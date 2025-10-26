import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// ایجاد instance با تنظیمات پایه
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor برای اضافه کردن توکن به همه درخواست‌ها
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor برای مدیریت خطاها
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // اگر 401 بود و refresh token داریم، تلاش برای تجدید
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          localStorage.setItem('access_token', response.data.access);
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // اگه refresh هم کار نکرد، لاگ اوت
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (username, password) =>
    api.post('/auth/login/', { username, password }),
  
  register: (userData) =>
    api.post('/auth/register/', userData),
  
  logout: (refreshToken) =>
    api.post('/auth/logout/', { refresh: refreshToken }),
  
  getCurrentUser: () =>
    api.get('/auth/me/'),
};

// Mine APIs
export const mineAPI = {
  getAll: () => api.get('/mines/'),
  getById: (id) => api.get(`/mines/${id}/`),
  create: (data) => api.post('/mines/', data),
  update: (id, data) => api.patch(`/mines/${id}/`, data),
  delete: (id) => api.delete(`/mines/${id}/`),
  getMyMines: () => api.get('/mines/my_mines/'),
};

// Spatial Data APIs
export const spatialAPI = {
  getDEMs: (mineId) => api.get('/dems/', { params: { mine: mineId } }),
  uploadDEM: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => formData.append(key, data[key]));
    return api.post('/dems/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  getLayers: (mineId) => api.get('/layers/', { params: { mine: mineId } }),
  uploadLayer: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => formData.append(key, data[key]));
    return api.post('/layers/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Dashboard APIs
export const dashboardAPI = {
  getFuelData: (mineId) => api.get('/fuel/', { params: { mine: mineId } }),
  getFuelStats: (mineId) => api.get('/fuel/statistics/', { params: { mine: mineId } }),
  addFuelRecord: (data) => api.post('/fuel/', data),
  
  getDailyReports: (mineId) => api.get('/reports/', { params: { mine: mineId } }),
  getReportSummary: (mineId) => api.get('/reports/summary/', { params: { mine: mineId } }),
  addDailyReport: (data) => api.post('/reports/', data),
};

export default api;
