import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  server: {
    // Em desenvolvimento, /api é repassado para o backend na AWS (o mesmo que a
    // Vercel usa no vercel.json), evitando CORS.
    proxy: {
      '/api': {
        target: 'http://52.73.232.44:8080',
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
