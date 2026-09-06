import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const dbApiUrl = env.DB_API_URL || process.env.DB_API_URL || ''

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],

    envPrefix: ['VITE_', 'DB_'],

    define: {
      'import.meta.env.DB_API_URL': JSON.stringify(dbApiUrl),
    },
  }
})