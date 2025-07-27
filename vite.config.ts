import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    // Ensure NODE_ENV is properly defined for production builds
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  build: {
    // Improve chunk size
    chunkSizeWarningLimit: 1000,
    // Add production optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          charts: ['chart.js', 'react-chartjs-2'],
          supabase: ['@supabase/supabase-js'],
          ui: ['lucide-react', 'react-toastify']
        }
      }
    }
  },
  server: {
    // Optimize for mobile development
    host: true,
    port: 3000
  }
});