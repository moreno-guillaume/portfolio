import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: 'assets',
  
  build: {
    outDir: '../public/build',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: {
        app: resolve(__dirname, 'assets/js/app.js'),
      }
    }
  },
  
  // Configuration SCSS corrigée
  css: {
    preprocessorOptions: {
      scss: {
        // Pas d'import automatique pour éviter les conflits
        // On fera les imports manuellement dans chaque fichier
      }
    }
  },
  
  server: {
    origin: 'http://localhost:5173'
  }
})