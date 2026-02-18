import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Port for the frontend
    port: 5173,
    // Proxy API requests to the backend
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      // Also proxy WebSocket connections
      '/ws': {
        target: 'ws://localhost:5000',
        ws: true,
      }
    }
  }
})