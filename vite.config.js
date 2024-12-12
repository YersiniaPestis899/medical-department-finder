import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // 環境変数の明示的な読み込み
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // 環境変数の明示的な定義
      'import.meta.env.VITE_AWS_REGION': JSON.stringify(env.VITE_AWS_REGION || 'us-west-2'),
      'import.meta.env.VITE_AWS_ACCESS_KEY_ID': JSON.stringify(env.VITE_AWS_ACCESS_KEY_ID),
      'import.meta.env.VITE_AWS_SECRET_ACCESS_KEY': JSON.stringify(env.VITE_AWS_SECRET_ACCESS_KEY),
    },
    server: {
      // 開発サーバーの設定
      watch: {
        ignored: ['!**/node_modules/**'],
      },
    },
  };
});