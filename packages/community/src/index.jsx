import { createRoot } from 'react-dom/client';
import { Router } from 'react-router-dom';
import history from '~/common/history';
// import { CookiesProvider } from 'react-cookie';

import './index.css';
import 'remixicon/fonts/remixicon.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

if (process.env.NODE_ENV === 'production') {
  console.log('production mode');
  window.dataLayer = window.dataLayer || [];
   
  function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', 'UA-154430849-1');
}

// const store = createStore(reducers);

// After
const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(
  <Router basename="/page" history={history}>
    <App />
  </Router>,
);

serviceWorker.unregister();
