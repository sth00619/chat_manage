import { create } from 'zustand';
import { authService } from '@/services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false, isLoading: false });
      return false;
    }
    
    set({ isLoading: true });
    try {
      const response = await authService.getProfile();
      set({ 
        user: response.data.user, 
        token, 
        isAuthenticated: true,
        isLoading: false 
      });
      return true;
    } catch (error) {
      localStorage.removeItem('token');
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false,
        isLoading: false 
      });
      return false;
    }
  },
  
  updateUser: (userData) => {
    set((state) => ({
      user: { ...state.user, ...userData }
    }));
  },
}));

export default useAuthStore;