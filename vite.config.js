import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      exclude: /_tmp-unused\//,
      png: { quality: 70 },
      jpg: { quality: 70 },
      jpeg: { quality: 70 },
      webp: { lossless: false, quality: 70 },
    }),
  ],
  build: {
    minify: 'esbuild',
    cssCodeSplit: true,
    cssMinify: 'esbuild',
  }
})
