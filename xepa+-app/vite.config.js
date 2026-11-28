import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  server: {
    // Em desenvolvimento, /api vai para o backend na AWS por HTTPS (evita CORS).
    proxy: {
      '/api': {
        target: 'https://api.xepamais.com.br',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
