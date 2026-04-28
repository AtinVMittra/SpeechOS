import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: true,
  },
  server: {
    proxy: {
      '/api/daily': {
        target: 'https://api.daily.co',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/daily/, '/v1'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            const key = process.env.DAILY_API_KEY
            if (key) proxyReq.setHeader('Authorization', `Bearer ${key}`)
          })
        },
      },
      '/api/elevenlabs': {
        target: 'https://api.elevenlabs.io',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/elevenlabs/, ''),
      },
      '/api/heygen': {
        target: 'https://api.heygen.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/heygen/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            const key = process.env.HEYGEN_API_KEY
            if (key) proxyReq.setHeader('X-Api-Key', key)
          })
        },
      },
    },
  },
})
