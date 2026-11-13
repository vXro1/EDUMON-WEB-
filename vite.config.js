import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Destino del proxy de desarrollo (/api, /uploads, /static, /socket.io).
// Por defecto el backend local; nunca producción, para no escribir datos reales
// desde el entorno de desarrollo. Se configura en .env.local (ver .env.example).
const PROXY_POR_DEFECTO = 'http://localhost:4000';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_API_PROXY_TARGET || PROXY_POR_DEFECTO;

  return {
    plugins: [react()],
    server: {
      port: 5174,
      proxy: {
        // /api, /uploads (archivos subidos) y /static (avatares) los sirve el backend
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: proxyTarget.startsWith('https://'),
        },
        '/uploads': {
          target: proxyTarget,
          changeOrigin: true,
          secure: proxyTarget.startsWith('https://'),
        },
        '/static': {
          target: proxyTarget,
          changeOrigin: true,
          secure: proxyTarget.startsWith('https://'),
        },
        // socket.io (notificaciones en tiempo real): en producción nginx lo
        // reenvía solo, pero en dev el server de Vite necesita esta entrada
        // (con ws:true) o el cliente intenta conectar contra sí mismo y las
        // notificaciones en vivo nunca llegan, aunque la API REST sí funcione.
        '/socket.io': {
          target: proxyTarget,
          changeOrigin: true,
          secure: proxyTarget.startsWith('https://'),
          ws: true,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.{js,jsx}'],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (/node_modules[\/](react|react-dom|react-router|react-router-dom|scheduler)[\/]/.test(id)) {
              return 'vendor.react';
            }
          },
        },
      },
    },
  };
});
