import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/login': 'http://127.0.0.1:8000',
      '/signup': 'http://127.0.0.1:8000',
      '/request': 'http://127.0.0.1:8000',
      '/inventory': 'http://127.0.0.1:8000',
      '/donor': 'http://127.0.0.1:8000',
      '/eligibility': 'http://127.0.0.1:8000',
      '/admin': 'http://127.0.0.1:8000',
      '/donations': 'http://127.0.0.1:8000',
      '/auth': 'http://127.0.0.1:8000',
      '/send-otp': 'http://127.0.0.1:8000',
      '/verify-otp': 'http://127.0.0.1:8000',
      '/forgot-password': 'http://127.0.0.1:8000',
      '/users': 'http://127.0.0.1:8000',
      '/camps': 'http://127.0.0.1:8000',
      '/geo': 'http://127.0.0.1:8000',
      '/chat': 'http://127.0.0.1:8000',
      '/api': 'http://127.0.0.1:8000',
    }
  }
})
