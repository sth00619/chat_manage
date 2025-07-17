import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

// Chat services
export const chatService = {
  sendMessage: (message) => api.post('/chat/message', { message }),
};

// Data services
export const dataService = {
  // Contacts
  getContacts: () => api.get('/data/contacts'),
  createContact: (data) => api.post('/data/contacts', data),
  updateContact: (id, data) => api.put(`/data/contacts/${id}`, data),
  deleteContact: (id) => api.delete(`/data/contacts/${id}`),
  
  // Credentials
  getCredentials: () => api.get('/data/credentials'),
  createCredential: (data) => api.post('/data/credentials', data),
  updateCredential: (id, data) => api.put(`/data/credentials/${id}`, data),
  deleteCredential: (id) => api.delete(`/data/credentials/${id}`),
  
  // Goals
  getGoals: () => api.get('/data/goals'),
  createGoal: (data) => api.post('/data/goals', data),
  updateGoal: (id, data) => api.put(`/data/goals/${id}`, data),
  deleteGoal: (id) => api.delete(`/data/goals/${id}`),
  
  // Schedules
  getSchedules: (params) => api.get('/data/schedules', { params }),
  createSchedule: (data) => api.post('/data/schedules', data),
  updateSchedule: (id, data) => api.put(`/data/schedules/${id}`, data),
  deleteSchedule: (id) => api.delete(`/data/schedules/${id}`),
  
  // Numerical Info
  getNumericalInfo: () => api.get('/data/numerical-info'),
  createNumericalInfo: (data) => api.post('/data/numerical-info', data),
  updateNumericalInfo: (id, data) => api.put(`/data/numerical-info/${id}`, data),
  deleteNumericalInfo: (id) => api.delete(`/data/numerical-info/${id}`),
  
  // Albums
  getAlbums: () => api.get('/data/albums'),
  uploadImage: (formData) => api.post('/data/albums/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteAlbum: (id) => api.delete(`/data/albums/${id}`),
};

// Admin services
export const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserDetails: (id) => api.get(`/admin/users/${id}`),
  updateUserRole: (id, data) => api.put(`/admin/users/${id}/role`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getSystemHealth: () => api.get('/admin/health'),
};

export default api;