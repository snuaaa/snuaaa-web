import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { extractCritical } from '@emotion/server';
import App from './App';

// Used only at build time by scripts/prerender.js.
export function render() {
  const { html, css, ids } = extractCritical(
    renderToString(
      <StrictMode>
        <App />
      </StrictMode>,
    ),
  );
  // `data-emotion` lets @emotion/css on the client reuse these rules instead of inserting them again.
  const style = `<style data-emotion="css ${ids.join(' ')}">${css}</style>`;
  return { html, head: style };
}
