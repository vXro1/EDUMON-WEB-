import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// VITE_BACKEND_URL (en .env.local, ignorado por git) apunta el proxy a un
// backend local, ej. http://localhost:4000; sin ella se usa producción
const backend = loadEnv('development', process.cwd(), '').VITE_BACKEND_URL || 'https://edumon.uniautonoma.edu.co'
const seguro = backend.startsWith('https')

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      // /api, /uploads (archivos subidos) y /static (avatares) los sirve el backend
      '/api': {
        target: backend,
        changeOrigin: true,
        secure: seguro,
      },
      '/uploads': {
        target: backend,
        changeOrigin: true,
        secure: seguro,
      },
      '/static': {
        target: backend,
        changeOrigin: true,
        secure: seguro,
      },
      // socket.io (notificaciones en tiempo real): en producción nginx lo
      // reenvía solo, pero en dev el server de Vite necesita esta entrada
      // (con ws:true) o el cliente intenta conectar contra sí mismo y las
      // notificaciones en vivo nunca llegan, aunque la API REST sí funcione.
      '/socket.io': {
        target: backend,
        changeOrigin: true,
        secure: seguro,
        ws: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor.react';
            return 'vendor';
          }
          // cursos + foros comparten contexto (CursoContext, ForosTab) — un solo chunk evita el ciclo
          if (id.includes('src/features/cursos') || id.includes('src/features/foros')) return 'feature.cursos';
          if (id.includes('src/features/tareas')) return 'feature.tareas';
        }
      }
    }
  }
})