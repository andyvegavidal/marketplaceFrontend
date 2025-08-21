import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5050', // for local dev only
        changeOrigin: true,
        secure: false
      }
    }
  },
  preview: {
    allowedHosts: ['.railway.app'],        // ✅ allow Railway URLs
    port: process.env.PORT || 3000,        // ✅ Railway provides a port
    host: '0.0.0.0'                        // ✅ listen on all interfaces
  }
})
