import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages ("Deploy from a branch") sirve el sitio bajo
  // https://jcbarbog.github.io/App-OCR/, no en la raíz del dominio. Este base
  // path debe coincidir EXACTO (mayúsculas incluidas) con el nombre del repo.
  base: '/App-OCR/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        lang: 'es',
        name: 'OCR Bibliográfico',
        short_name: 'OCR Biblio',
        description: 'Extrae datos de portadas de libros, libro por libro.',
        display: 'standalone',
        theme_color: '#1B2D4F',
        background_color: '#EAEDF2',
        start_url: '/App-OCR/',
        scope: '/App-OCR/',
        orientation: 'portrait',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache solo el app shell (HTML/JS/CSS/íconos). Los assets pesados
        // de Tesseract (worker, núcleo WASM, datos de idioma) no son
        // necesarios para que la app sea instalable y el OCR igual requiere
        // red, así que se excluyen del precache.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        globIgnores: ['**/tesseract/**', '**/tessdata/**'],
      },
    }),
  ],
  server: {
    host: true,
  },
})
