import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss() as any
  ],
  resolve: {
    alias: {
      '@': path.resolve('./src')
    }
  },
  root: 'tests/playground',
  server: {
    port: 3002,
    open: true,
    host: true
  },
  build: {
    outDir: '../../dist-playground',
    emptyOutDir: true
  }
})