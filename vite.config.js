import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: 'assets',  // ← Ajouter cette ligne
  
  build: {
    outDir: '../public/build',  // Adapter le chemin avec ../
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: resolve(__dirname, 'assets/js/app.js')
    }
  },
  
  css: {
    preprocessorOptions: {
      scss: {}
    }
  },
  
  server: {
    origin: 'http://localhost:5173'
  }
})