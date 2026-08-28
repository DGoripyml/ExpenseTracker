import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Forward /api to the FastAPI backend. Because the browser only ever calls
    // the Vite dev server, every request is same-origin and the backend needs
    // no CORS configuration.
    proxy: {
      '/api': 'http://127.0.0.1:8000',
    },
  },
})
