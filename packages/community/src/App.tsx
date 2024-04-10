import { useEffect } from 'react';

import './App.scss';

import Router from './router';
import { AuthProvider } from './contexts/auth';

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
    <div className="snuaaa-wrapper">
      <AuthProvider>
        <Router />;
      </AuthProvider>
    </div>
  );
}

export default App;
