import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Use the repository-name absolute base so GitHub Pages serves assets correctly
  // When deploying to: https://<user>.github.io/EHT-SURVEY-DAPP/
  // set base to '/EHT-SURVEY-DAPP/'. This ensures built asset paths include the repo prefix.
  base: '/EHT-SURVEY-DAPP/',
  plugins: [react()],
})
