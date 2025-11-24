import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // use relative assets so the site works when served from GitHub Pages
  base: './',
  plugins: [react()],
})
