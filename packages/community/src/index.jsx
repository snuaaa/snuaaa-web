import { createRoot } from 'react-dom/client';
import { Router } from 'react-router-dom';
import history from '~/common/history';
// import { CookiesProvider } from 'react-cookie';

import './index.css';
import 'remixicon/fonts/remixicon.css';
import App from './App';
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

// After
const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(
  <Router basename="/page" history={history}>
    <App />
  </Router>,
);
