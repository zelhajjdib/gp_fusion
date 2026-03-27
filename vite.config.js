import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main:        resolve(__dirname, 'index.html'),
        achat:       resolve(__dirname, 'achat.html'),
        vente:       resolve(__dirname, 'vente.html'),
        location:    resolve(__dirname, 'location.html'),
        diagnostic:  resolve(__dirname, 'diagnostic.html'),
        nettoyage:   resolve(__dirname, 'nettoyage.html'),
        polissage:   resolve(__dirname, 'polissage.html'),
        ceramique:   resolve(__dirname, 'ceramique.html'),
        vehicule:    resolve(__dirname, 'vehicule.html'),
        detail:      resolve(__dirname, 'detail.html'),
      }
    }
  }
});
