import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './entrypoints'),
      '@content': path.resolve(__dirname, './entrypoints/content'),
      '@utils': path.resolve(__dirname, './entrypoints/content/utils'),
    },
  },
  test: {
    coverage: {
      exclude: [
        'entrypoints/**/*.d.ts',
        'entrypoints/**/types.ts',
        'entrypoints/**/config.ts',
        'node_modules',
        'tests',
      ],
      include: ['entrypoints/**/*.ts'],
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
})
