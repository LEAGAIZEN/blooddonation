import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxies all /api/* requests → FastAPI backend
      // This handles:
      //   Request.jsx        → POST /api/blood-request
      //   AdminUserRecords   → GET/PATCH/PUT/DELETE /api/users/*
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        // No rewrite — /api/users stays /api/users on the backend
      },
    },
  },
})
