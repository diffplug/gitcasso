import { vi } from 'vitest'

/**
 * Sets up common mocks that are needed by most DOM-based tests.
 *
 * This function should be called at the top level of test files to ensure
 * proper hoisting of vi.mock calls.
 *
 * Example usage:
 * ```typescript
 * import { vi } from 'vitest'
 * import { setupCommonMocks } from '../mock-setup'
 *
 * setupCommonMocks()
 *
 * // ... rest of your test imports and code
 * ```
 */
export function setupCommonMocks() {
  // Mock the webextension defineContentScript global
  vi.stubGlobal('defineContentScript', vi.fn())

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
}
