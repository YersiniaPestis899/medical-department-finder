import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      'import.meta.env.AWS_REGION': JSON.stringify(env.AWS_REGION || 'us-west-2'),
      'import.meta.env.AWS_ACCESS_KEY_ID': JSON.stringify(env.AWS_ACCESS_KEY_ID),
      'import.meta.env.AWS_SECRET_ACCESS_KEY': JSON.stringify(env.AWS_SECRET_ACCESS_KEY),
    },
  };
});