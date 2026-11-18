import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base './' so the build works at daniel86445.github.io/valence/ (GitHub Pages) and anywhere else.
export default defineConfig({
  base: './',
  plugins: [react()],
  test: { environment: 'node' },
} as never)
