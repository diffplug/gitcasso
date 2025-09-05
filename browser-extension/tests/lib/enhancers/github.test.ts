import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EnhancerRegistry } from '../../../src/lib/registries'
import { PAGES } from '../../har-index'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Mock WXT's defineContentScript global
vi.stubGlobal('defineContentScript', vi.fn())

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Helper function to load and extract HTML from HAR files
async function loadHarHtml(key: string): Promise<string> {
  const harPath = path.join(__dirname, '../../har', `${key}.har`)
  const harContent = await fs.readFile(harPath, 'utf-8')
  const harData = JSON.parse(harContent)

  // Find the main HTML response (same logic as har-view.ts)
  const mainEntry = harData.log.entries.find((entry: any) => 
    entry.request.url.includes('github.com') && 
    entry.response.content.mimeType?.includes('text/html') &&
    entry.response.content.text
  )

  if (!mainEntry) {
    throw new Error(`No HTML content found in HAR file: ${key}.har`)
  }

  return mainEntry.response.content.text
}

describe('github', () => {
  beforeEach(() => {
    // Reset DOM between tests
    document.body.innerHTML = ''
    
    // Mock console methods to avoid noise
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  // Helper to setup DOM environment with location mocking
  function setupDOMEnvironment(url: string, html: string) {
    // Set up the HTML content
    document.body.innerHTML = html
    
    // Mock window.location.pathname for GitHub enhancer
    Object.defineProperty(window.location, 'pathname', {
      value: new URL(url).pathname,
      configurable: true
    })
    
    // Add GitHub hostname meta tag (for the enhancer's new hostname check)
    const meta = document.createElement('meta')
    meta.name = 'hostname'
    meta.content = 'github.com'
    document.head.appendChild(meta)
  }

  it('should identify gh_pr textarea and create proper spot object', async () => {
    const enhancers = new EnhancerRegistry()
    const url = PAGES.gh_pr
    
    // Load the HTML from HAR file
    const html = await loadHarHtml('gh_pr')
    
    // Setup DOM environment with proper location
    setupDOMEnvironment(url, html)
    
    // Get all textarea elements from the page
    const textareas = document.querySelectorAll('textarea')
    
    // Try to enhance each textarea - should find at least one GitHub textarea
    let enhancedCount = 0
    let lastEnhancedResult: any = null
    
    for (const textarea of textareas) {
      const enhancedTextarea = enhancers.tryToEnhance(textarea as HTMLTextAreaElement)
      if (enhancedTextarea) {
        enhancedCount++
        lastEnhancedResult = enhancedTextarea
      }
    }
    
    expect(enhancedCount).toBeGreaterThan(0)
    expect(lastEnhancedResult).toBeTruthy()
    
    // Snapshot test on the spot object structure
    expect(lastEnhancedResult.spot).toMatchInlineSnapshot(`
      {
        "domain": "github.com",
        "number": 517,
        "slug": "diffplug/selfie",
        "type": "GH_PR_ADD_COMMENT",
        "unique_key": "github.com:diffplug/selfie:517",
      }
    `)
    
    // Verify specific fields based on the URL
    const urlObj = new URL(url)
    const match = urlObj.pathname.match(/^\/([^/]+)\/([^/]+)\/(?:pull|issues)\/(\d+)/)
    expect(match).toBeTruthy() // Ensure URL pattern matches
    
    const [, owner, repo, numberStr] = match!
    
    expect(owner).toBeDefined()
    expect(repo).toBeDefined()
    expect(numberStr).toBeDefined()
    
    expect(lastEnhancedResult.spot.slug).toBe(`${owner}/${repo}`)
    expect(lastEnhancedResult.spot.number).toBe(parseInt(numberStr!, 10))
    expect(lastEnhancedResult.spot.unique_key).toBe(`github.com:${owner}/${repo}:${numberStr}`)
  })
})
