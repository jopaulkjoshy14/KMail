// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/KMail/',  // 👈 IMPORTANT for GitHub Pages
  server: {
    port: 5173,
  }
})
