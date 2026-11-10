import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  resolve: { alias: { '~': path.resolve(__dirname, './src') } },
  server: {
    port: 3001,
  },
  build: isSsrBuild
    ? { outDir: 'build-server', emptyOutDir: true, copyPublicDir: false }
    : { outDir: 'build' },
}));
