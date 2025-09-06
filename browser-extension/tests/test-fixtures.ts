import { describe as baseDescribe, test as baseTest, expect } from 'vitest'
import type { PAGES } from './har-index'
import { cleanupDOM, setupHarDOM } from './test-utils'

export const describe = baseDescribe

// Re-export expect from vitest
export { expect }

// Fluent interface for HAR-based tests
export function usingHar(harKey: keyof typeof PAGES) {
  return {
    it: (name: string, fn: () => void | Promise<void>) => {
      return baseTest(name, async () => {
        // Setup HAR DOM before test
        await setupHarDOM(harKey)

        try {
          return await fn()
        } finally {
          // Cleanup after test
          cleanupDOM()
        }
      })
    },
  }
}
