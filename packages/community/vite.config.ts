import { defineConfig } from 'vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import ckeditor5 from '@ckeditor/vite-plugin-ckeditor5';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

// Source maps are uploaded to Sentry only when the auth token is provided
// (SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT), e.g. in the deploy workflow.
const uploadSourceMaps = !!process.env.SENTRY_AUTH_TOKEN;

export default defineConfig({
  plugins: [
    // Please make sure that '@tanstack/router-plugin' is passed before '@vitejs/plugin-react'
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    ckeditor5({ theme: require.resolve('@ckeditor/ckeditor5-theme-lark') }),
    uploadSourceMaps &&
      sentryVitePlugin({
        telemetry: false,
        sourcemaps: { filesToDeleteAfterUpload: ['./build/**/*.map'] },
      }),
  ],
  envPrefix: 'REACT_APP_',
  resolve: { alias: { '~': path.resolve(__dirname, './src') } },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build',
    sourcemap: uploadSourceMaps ? 'hidden' : false,
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
});
