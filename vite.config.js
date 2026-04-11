import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// For GitHub Pages, set base to the repo name (e.g. '/semillero/').
// Override at build time via VITE_BASE env var if the repo name changes.
const base = process.env.VITE_BASE ?? '/semillero/'

export default defineConfig({
  plugins: [react()],
  base,
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
})
