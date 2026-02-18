import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';

import './index.css';
import 'remixicon/fonts/remixicon.css';
import { IS_PROD } from './constants/env';

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
root.render(<RouterProvider router={router} />);
