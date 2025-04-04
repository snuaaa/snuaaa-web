import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import ckeditor5 from '@ckeditor/vite-plugin-ckeditor5';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ckeditor5({ theme: require.resolve('@ckeditor/ckeditor5-theme-lark') }),
  ],
  envPrefix: 'REACT_APP_',
  resolve: { alias: { '~': path.resolve(__dirname, './src') } },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build',
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
});
