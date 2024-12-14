import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    base: './',
    define: {
      'import.meta.env.AWS_REGION': JSON.stringify(env.AWS_REGION || 'us-west-2'),
      'import.meta.env.AWS_ACCESS_KEY_ID': JSON.stringify(env.AWS_ACCESS_KEY_ID),
      'import.meta.env.AWS_SECRET_ACCESS_KEY': JSON.stringify(env.AWS_SECRET_ACCESS_KEY),
      'import.meta.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(env.VITE_GOOGLE_MAPS_API_KEY),
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      }
    },
    server: {
      https: true // 開発時もHTTPSを使用
    }
  };
});