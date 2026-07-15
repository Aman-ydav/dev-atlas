import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    // mermaid lazy-loads a separate chunk per diagram type (flowchart,
    // sequence, state, er...) via its own internal dynamic import() calls.
    // If Vite discovers one of those mid-session (e.g. the first time a
    // sequenceDiagram is actually rendered) it re-optimizes and rotates
    // every chunk hash, which orphans any reference an already-open tab is
    // still holding ("Failed to fetch dynamically imported module").
    // Including mermaid here makes Vite crawl its whole graph — diagram
    // subtypes included — on cold start instead of discovering it lazily.
    include: ['mermaid'],
  },
})
