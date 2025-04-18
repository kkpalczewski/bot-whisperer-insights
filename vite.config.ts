
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.yaml'],
  optimizeDeps: {
    exclude: ['glob'], // Exclude glob from optimization to prevent browser compatibility issues
  },
  server: {
    host: "::",
    port: 8080,
  }
}))
