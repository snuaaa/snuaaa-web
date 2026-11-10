// Renders the page to static HTML after `vite build` (client) and `vite build --ssr` (server bundle),
// so crawlers that don't run JavaScript (Naver, KakaoTalk/Naver link previews) still see the content.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'build');
const serverDir = path.join(root, 'build-server');

const { render } = await import(
  pathToFileURL(path.join(serverDir, 'entry-server.js')).href
);
const { html, head } = render();

const templatePath = path.join(outDir, 'index.html');
const template = fs.readFileSync(templatePath, 'utf-8');
if (
  !template.includes('<!--app-html-->') ||
  !template.includes('<!--app-head-->')
) {
  throw new Error(
    'index.html is missing the <!--app-head--> or <!--app-html--> placeholder',
  );
}
fs.writeFileSync(
  templatePath,
  template.replace('<!--app-head-->', head).replace('<!--app-html-->', html),
);
fs.rmSync(serverDir, { recursive: true, force: true });
console.log(`Prerendered ${path.relative(root, templatePath)}`);
