import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // The React site runs on port 5173 and Java (the backend) runs on port 8080.
  server: {
  // This sends every request that starts with /api to the backend Java (port 8080)
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})

