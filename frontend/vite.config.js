import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5001',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err.message);
            if (err.code === 'ECONNREFUSED') {
              console.log('Backend server not found. Make sure backend is running on port 5002 or set VITE_API_URL environment variable.');
            }
          });
        }
      },
      // ✅ Thêm proxy này để serve ảnh từ backend
      '/images': {
        target: process.env.VITE_API_URL || 'http://localhost:5001',
        changeOrigin: true,
      }
    }
  }
})