import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import './App.scss';
import './index.css';

import Router from './router';
import { AuthProvider } from './contexts/auth';
import { BoardProvider } from './contexts/board';
import { ViewportSizeProvider } from './contexts/viewportSize';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  useEffect(() => {
    if (navigator.userAgent.toLowerCase().indexOf('msie') !== -1) {
      alert(
        'MicroSoft Internet Explorer에서는 홈페이지가 정상 동작하지 않을 수 있습니다.',
      );
    } else if (
      navigator.appName === 'Netscape' &&
      navigator.userAgent.search('Trident') !== -1
    ) {
      alert(
        'MicroSoft Internet Explorer에서는 홈페이지가 정상 동작하지 않을 수 있습니다.',
      );
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-full flex flex-col">
        <ViewportSizeProvider>
          <AuthProvider>
            <BoardProvider>
              <Router />
            </BoardProvider>
          </AuthProvider>
        </ViewportSizeProvider>
      </div>
    </QueryClientProvider>
  );
}

export default App;
