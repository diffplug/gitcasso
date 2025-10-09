import { vi } from "vitest"

// Mock MutationObserver for tests
global.MutationObserver = vi.fn().mockImplementation(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  takeRecords: vi.fn(() => []),
}))

// Mock the OverType editor component
vi.mock("overtype", () => {
  const mockConstructor = vi.fn().mockImplementation(() => [
    {
      container: document.createElement("div"),
      destroy: vi.fn(),
      focus: vi.fn(),
      getValue: vi.fn(() => ""),
      preview: document.createElement("div"),
      setValue: vi.fn(),
      textarea: document.createElement("textarea"),
      updatePreview: vi.fn(),
      wrapper: document.createElement("div"),
    },
  ])
  ;(mockConstructor as any).setCodeHighlighter = vi.fn()
  ;(mockConstructor as any).setTheme = vi.fn()
  return {
    default: mockConstructor,
  }
})

import { describe as baseDescribe, test as baseTest, expect } from "vitest"
import {
  DRAFT_STORAGE_UNSUPPORTED,
  type StrippedLocation,
} from "@/lib/enhancer"
import { EnhancerRegistry } from "../src/lib/registries"
import type { CORPUS } from "./corpus/_corpus-index"
import { cleanupDOM, setupDOM } from "./corpus-utils"

export const describe = baseDescribe

// Re-export expect from vitest
export { expect }

// Fluent interface for any corpus type (HAR or HTML)
export function withCorpus(corpusKey: keyof typeof CORPUS) {
  return {
    it: (name: string, fn: () => void | Promise<void>) => {
      return baseTest(`${String(corpusKey)}:${name}`, async () => {
        // Setup DOM for any corpus type (delegates to HAR or HTML based on type)
        await setupDOM(corpusKey)

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

// Helper function for detection tests
export function detectedSpots() {
  const enhancers = new EnhancerRegistry()
  const textareas = document.querySelectorAll("textarea")
  const location: StrippedLocation = {
    host: window.location.host,
    pathname: window.location.pathname,
    search: window.location.search,
  }
  const detectionResults = []
  for (const textarea of textareas) {
    const enhanced = enhancers.tryToEnhance(textarea, location)
    const forValue = `id=${textarea.id} name=${textarea.name} className=${textarea.className}`
    detectionResults.push({
      for: forValue,
      spot: enhanced ? enhanced.spot : "NO_SPOT",
    })
  }
  return detectionResults
}

// Helper function for UI tests
export function tableUI() {
  const enhancers = new EnhancerRegistry()
  const textareas = document.querySelectorAll("textarea")
  const location: StrippedLocation = {
    host: window.location.host,
    pathname: window.location.pathname,
    search: window.location.search,
  }
  const uiResults = []
  for (const textarea of textareas) {
    const enhanced = enhancers.tryToEnhance(textarea, location)
    const forValue = `id=${textarea.id} name=${textarea.name} className=${textarea.className}`
    if (enhanced) {
      // Skip spots that don't support table display (DRAFT_STORAGE_UNSUPPORTED)
      if (enhanced.spot.unique_key === DRAFT_STORAGE_UNSUPPORTED) {
        continue
      }
      uiResults.push({
        for: forValue,
        title: enhanced.enhancer.tableTitle(enhanced.spot),
        upperDecoration: enhanced.enhancer.tableUpperDecoration(enhanced.spot),
      })
    }
  }
  return uiResults
}
