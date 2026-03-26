import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Use relative paths for GitHub Pages
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        vente: resolve(__dirname, 'vente.html'),
        location: resolve(__dirname, 'location.html'),
        detail: resolve(__dirname, 'detail.html')
      }
    }
  }
});
