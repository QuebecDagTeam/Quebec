import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  esbuild: {
    sourcemap: false, // ⛔ prevent source map errors from esbuild
  },
  optimizeDeps: {
    esbuildOptions: {
      sourcemap: false, // ⛔ also prevent during dependency pre-bundling
    },
  },
})
