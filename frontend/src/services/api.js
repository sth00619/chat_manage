import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10초 타임아웃
});

// 토큰 가져오기 헬퍼 함수
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고 아직 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // 로그인 페이지로 리다이렉트 (단, 로그인 API 호출이 아닌 경우)
      if (!originalRequest.url.includes('/auth/login')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
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
  
  // getUsers를 axios를 사용하도록 수정
  getUsers: async ({ page, limit, search }) => {
    try {
      // axios는 params 객체를 자동으로 쿼리 스트링으로 변환
      const params = {};
      if (page) params.page = page;
      if (limit) params.limit = limit;
      if (search) params.currentSearchTerm = search; // 백엔드가 currentSearchTerm으로 받음
      
      console.log('API: Getting users with params:', params);
      
      const response = await api.get('/admin/users', { params });
      console.log('API: Users response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  getUserDetails: async (id) => {
    console.log('API: Getting user details for ID:', id);
    const response = await api.get(`/admin/users/${id}`);
    console.log('API: User details response:', response.data);
    return response.data;
  },
  
  updateUserRole: (id, data) => api.put(`/admin/users/${id}/role`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getSystemHealth: () => api.get('/admin/health'),
};

export default api;