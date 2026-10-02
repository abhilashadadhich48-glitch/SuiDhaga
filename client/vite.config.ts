import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  build: {
    // No source maps in production (smaller bundle, faster load)
    sourcemap: false,
    rollupOptions: {
      output: {
        // Content-hash filenames: every deploy gets new unique URLs → safe for 1-year cache headers
        // Example: index-DQ_0xg3i.css — the hash changes whenever file content changes
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
})
