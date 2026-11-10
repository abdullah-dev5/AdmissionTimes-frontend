import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  esbuild:
    mode === 'production'
      ? {
          // Debug logging often includes user/admission data: strip it from
          // production bundles while keeping warnings and errors.
          pure: ['console.log', 'console.debug', 'console.info'],
          drop: ['debugger'],
        }
      : undefined,
}))
