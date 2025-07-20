import '@/styles/globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import useAuthStore from '@/store/useAuthStore';
import Layout from '@/components/Layout/Layout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5분
    },
  },
});

const publicRoutes = ['/login', '/register', '/auth/callback'];

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-gray-600">로딩 중...</p>
      </div>
    </div>
  );
}

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const { checkAuth, isAuthenticated, isLoading, isInitialized } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 앱 시작 시 인증 확인
    const initAuth = async () => {
      await checkAuth();
      setIsReady(true);
    };

    initAuth();
  }, []);

  useEffect(() => {
    // 인증 상태와 라우트 동기화
    if (isInitialized && !isLoading) {
      const isPublicRoute = publicRoutes.includes(router.pathname);
      
      if (!isAuthenticated && !isPublicRoute) {
        router.push('/login');
      } else if (isAuthenticated && router.pathname === '/login') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isInitialized, isLoading, router.pathname]);

  // 초기 로딩 중일 때 로딩 화면 표시
  if (!isReady || !isInitialized) {
    return (
      <QueryClientProvider client={queryClient}>
        <LoadingScreen />
      </QueryClientProvider>
    );
  }

  const isPublicRoute = publicRoutes.includes(router.pathname);

  // 인증이 필요한 페이지인데 로딩 중이거나 인증되지 않은 경우
  if (!isPublicRoute && (isLoading || !isAuthenticated)) {
    return (
      <QueryClientProvider client={queryClient}>
        <LoadingScreen />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      {isPublicRoute ? (
        <Component {...pageProps} />
      ) : (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
    </QueryClientProvider>
  );
}