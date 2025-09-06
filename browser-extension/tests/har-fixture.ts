import { vi } from 'vitest'

// Mock the OverType editor component
vi.mock('../src/overtype/overtype', () => {
  const mockConstructor = vi.fn().mockImplementation(() => [
    {
      container: document.createElement('div'),
      destroy: vi.fn(),
      focus: vi.fn(),
      getValue: vi.fn(() => ''),
      preview: document.createElement('div'),
      setValue: vi.fn(),
      textarea: document.createElement('textarea'),
      wrapper: document.createElement('div'),
    },
  ])
  ;(mockConstructor as any).setCodeHighlighter = vi.fn()
  return {
    default: mockConstructor,
  }
})

import { describe as baseDescribe, test as baseTest, expect } from 'vitest'
import type { PAGES } from './har/_har-index'
import { cleanupDOM, setupHarDOM } from './har-fixture-utils'

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
