// Force restart 1
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Standard Vite config for React using SWC
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 8001,
    strictPort: false,
    hmr: {
      overlay: true,
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react')) {
              return 'vendor-lucide';
            }
            if (id.includes('framer-motion') || id.includes('motion')) {
              return 'vendor-motion';
            }
            if (id.includes('@supabase') || id.includes('supabase-js')) {
              return 'vendor-supabase';
            }
          }
        }
      }
    },
    chunkSizeWarningLimit: 800
  }
})