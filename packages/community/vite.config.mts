import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'
 // import ckeditor5 from '@ckeditor/vite-plugin-ckeditor5';
 
 export default defineConfig({
   plugins: [
     react(),
     tailwindcss(),
     // ckeditor5({ }),
   ],
   envPrefix: 'REACT_APP_',
   resolve: { alias: { '~': path.resolve(__dirname, './src')}},
   server: {
     port: 3000,
     open: true,
   },
   build: {
     outDir: 'build',
     commonjsOptions: {
       include: [/@snuaaa\/editor/, /node_modules/],
     }
   },
   optimizeDeps: {
     include: [
       '@snuaaa/editor'
     ]
   }
 })