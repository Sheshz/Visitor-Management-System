import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Configure proxy for development
    proxy: {
      // Proxy API requests to backend server
      '/api': {
        target: 'http://localhost:5000', // Your backend server URL
        changeOrigin: true,
        secure: false,
      }
    },
    // Port for frontend development server
    port: 5173,
  }
});