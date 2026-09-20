import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The Spring Boot API has no CORS configuration, so in development (and in
// `vite preview`) requests to /api are proxied to it. The browser only ever
// talks to the Vite origin, which avoids CORS entirely.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_PROXY_TARGET || 'http://localhost:9090'
  const proxy = { '/api': { target, changeOrigin: true } }

  return {
    plugins: [react(), tailwindcss()],
    server: { port: 5173, proxy },
    preview: { port: 4173, proxy },
  }
})
