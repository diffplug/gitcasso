import { defineConfig } from 'vitest/config'
import { WxtVitest } from 'wxt/testing'

export default defineConfig({
  plugins: [WxtVitest()],
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
    environment: 'node',
    pool: 'threads',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
})
