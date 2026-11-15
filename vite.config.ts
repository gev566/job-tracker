import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' — относительные пути, чтобы сборка работала на GitHub Pages в любой папке
export default defineConfig({
  base: './',
  plugins: [react()],
})
