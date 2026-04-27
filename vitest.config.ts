import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['src/test/**/*.test.ts'],
    exclude: ['node_modules', '.next', 'dist'],
    typecheck: {
      ts: false,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})