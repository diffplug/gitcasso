import { describe as baseDescribe, test as baseTest, expect } from 'vitest'
import { PAGES } from './har-index'
import {
  cleanupDOM,
  createDOMFromHar,
  loadHtmlFromHar,
  setupDOMFromHar,
  type TestDOMGlobals,
} from './test-utils'

export interface TestFixtures {
  harDOM: (key: keyof typeof PAGES) => Promise<TestDOMGlobals>
}

export const test = baseTest.extend<TestFixtures>({
  // biome-ignore lint/correctness/noEmptyPattern: Required by Vitest fixture API
  harDOM: async ({}, use) => {
    let currentDOM: TestDOMGlobals | null = null

    const setupDOM = async (key: keyof typeof PAGES): Promise<TestDOMGlobals> => {
      // Clean up any existing DOM
      if (currentDOM) {
        cleanupDOM()
      }

      // Load HTML from HAR file
      const html = await loadHtmlFromHar(key)
      const url = PAGES[key]

      // Create and setup new DOM
      const domGlobals = createDOMFromHar(html, url)
      setupDOMFromHar(domGlobals)

      currentDOM = domGlobals
      return domGlobals
    }

    // Provide the setup function to the test
    await use(setupDOM)

    // Cleanup after test completes
    if (currentDOM) {
      cleanupDOM()
      currentDOM = null
    }
  },
})

export const describe = baseDescribe
export const it = test

// Re-export expect from vitest
export { expect }
