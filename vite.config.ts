import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load environment variables from .env files
  const env = loadEnv(mode, process.cwd(), '');
  
  // Log loaded environment variables (except sensitive ones)
  console.log('Environment variables loaded:', 
    Object.keys(env).filter(key => !key.includes('KEY') && !key.includes('SECRET'))
  );

  return {
    root: '.',
    base: '/',
    publicDir: 'public',
    
    server: {
      port: 3002,
      host: '0.0.0.0',
      open: true,
    },
    
    plugins: [react()],
    
    define: {
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
    },
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: true,
      
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
      },
    },
  };
});
