import { useEffect } from 'react';

import './App.scss';

import Router from './router';
import { AuthProvider } from './contexts/auth';
import { BoardProvider } from 'contexts/board';
import { ViewportSizeProvider } from 'contexts/viewportSize';

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
    <div className="min-h-full flex flex-col">
      <ViewportSizeProvider>
        <AuthProvider>
          <BoardProvider>
            <Router />
          </BoardProvider>
        </AuthProvider>
      </ViewportSizeProvider>
    </div>
  );
}

export default App;
