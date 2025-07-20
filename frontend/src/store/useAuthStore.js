import { create } from 'zustand';
import { authService } from '@/services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // 초기값을 true로 변경
  isInitialized: false,
  
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    set({ 
      user, 
      token, 
      isAuthenticated: true,
      isLoading: false,
      isInitialized: true
    });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true
    });
  },
  
  checkAuth: async () => {
    const token = localStorage.getItem('token');
    
    // 토큰이 없으면 바로 종료
    if (!token) {
      set({ 
        isAuthenticated: false, 
        isLoading: false, 
        isInitialized: true,
        user: null,
        token: null
      });
      return false;
    }
    
    // 토큰이 있으면 일단 인증된 것으로 설정
    set({ 
      token,
      isLoading: true 
    });
    
    try {
      // 프로필 정보 가져오기
      const response = await authService.getProfile();
      set({ 
        user: response.data.user, 
        token, 
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true
      });
      return true;
    } catch (error) {
      // 토큰이 유효하지 않으면 제거
      localStorage.removeItem('token');
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true
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