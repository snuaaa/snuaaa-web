import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { Suspense } from 'react';

import '../App.scss';
import '../index.css';

import { AuthProvider } from '../contexts/auth';
import { BoardProvider } from '../contexts/board';
import { ViewportSizeProvider } from '../contexts/viewportSize';
import Header from '../components/Header';
import Footer from '../components/Footer';
import RiseSet from '~/components/Home/RiseSet';
import SideBar from '~/components/Home/SideBar';

const TanStackRouterDevtools =
  process.env.NODE_ENV === 'production'
    ? () => null // Render nothing in production
    : React.lazy(() =>
        import('@tanstack/router-devtools').then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      );

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const location = useLocation();
  // Check if the current path is an auth path (login or signup)
  const isAuthPage = location.pathname.startsWith('/auth');

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-full flex flex-col">
        <ViewportSizeProvider>
          <AuthProvider>
            <BoardProvider>
              {isAuthPage ? (
                <Outlet />
              ) : (
                <>
                  <Header />
                  <div className="section-wrapper">
                    <section>
                      <div className="side-left">
                        <RiseSet />
                      </div>
                      <SideBar />
                      <Outlet />
                    </section>
                  </div>
                  <Footer />
                </>
              )}
            </BoardProvider>
          </AuthProvider>
        </ViewportSizeProvider>
      </div>
      <Suspense fallback={null}>
        <TanStackRouterDevtools />
      </Suspense>
    </QueryClientProvider>
  );
}
