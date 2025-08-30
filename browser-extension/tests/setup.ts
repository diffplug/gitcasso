import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mock browser APIs
interface GlobalWithBrowser {
  browser: {
    runtime: {
      sendMessage: ReturnType<typeof vi.fn>
      onMessage: {
        addListener: ReturnType<typeof vi.fn>
      }
    }
  }
  chrome: GlobalWithBrowser['browser']
}

const globalWithBrowser = global as unknown as GlobalWithBrowser

globalWithBrowser.browser = {
  runtime: {
    onMessage: {
      addListener: vi.fn(),
    },
    sendMessage: vi.fn(),
  },
}

globalWithBrowser.chrome = globalWithBrowser.browser

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  debug: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  log: vi.fn(),
  warn: vi.fn(),
}
