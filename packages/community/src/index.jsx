import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';
import { queryClient } from './lib/queryClient';

import './index.css';
import 'remixicon/fonts/remixicon.css';
import { IS_PROD } from './constants/env';
import { initSentry } from './lib/sentry';

initSentry();

if (IS_PROD) {
  console.log('production mode');
  window.dataLayer = window.dataLayer || [];

  function gtag() {
    window.dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', 'UA-154430849-1');
}

const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
// 라우트 beforeLoad/pending/error 컴포넌트에서도 쿼리를 쓸 수 있도록 라우터 바깥에 둔다.
root.render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>,
);
