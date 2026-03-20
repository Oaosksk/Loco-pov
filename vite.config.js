import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,      // fixes slow file watching on Windows
      interval: 300,         // check every 300ms
    },
    // Disable caching during development
    headers: {
      'Cache-Control': 'no-store',
    },
  },
  optimizeDeps: {
    force: false,
  },
  build: {
    // Add version hash to prevent caching issues
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
