import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['.ngrok-free.dev', '.ngrok.io'],
    watch: {
      usePolling: true,      // fixes slow file watching on Windows
      interval: 300,         // check every 300ms
    },
  },
  optimizeDeps: {
    force: false,
  },
})
