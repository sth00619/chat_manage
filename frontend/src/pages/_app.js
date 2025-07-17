import '@/styles/globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import useAuthStore from '@/store/useAuthStore';
import Layout from '@/components/Layout/Layout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const publicRoutes = ['/login', '/register', '/auth/callback'];

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated && !publicRoutes.includes(router.pathname)) {
      router.push('/login');
    }
  }, [isAuthenticated, router.pathname]);

  const isPublicRoute = publicRoutes.includes(router.pathname);

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