import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Proxy API requests to backend to avoid CORS issues
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // Rewrite path to remove /api prefix if backend expects it
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
