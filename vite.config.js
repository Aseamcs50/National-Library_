import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: [
      '.ngrok-free.app',  // يسمح بأي نطاق فرعي من ngrok-free.app
      'localhost'
    ]
  }
})