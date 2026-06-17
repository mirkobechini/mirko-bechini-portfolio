import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import { visualizer } from 'rollup-plugin-visualizer'

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
    visualizer({
      open: true, // 2. Apre automaticamente il report nel browser dopo il build
      filename: 'bundle-analysis.html',
    }),
  ],
  build: {
    minify: true,
    cssCodeSplit: true,
    cssMinify: true,
  }
})
