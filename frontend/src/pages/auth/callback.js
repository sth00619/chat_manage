import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '@/store/useAuthStore';

export default function AuthCallback() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const { token } = router.query;
      
      if (token) {
        // Store token and get user profile
        localStorage.setItem('token', token);
        
        try {
          const { authService } = await import('@/services/api');
          const response = await authService.getProfile();
          setAuth(response.data.user, token);
          router.push('/dashboard');
        } catch (error) {
          console.error('Auth callback error:', error);
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    };

    if (router.isReady) {
      handleCallback();
    }
  }, [router.isReady, router.query, router, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-gray-600">로그인 처리 중...</p>
      </div>
    </div>
  );
}