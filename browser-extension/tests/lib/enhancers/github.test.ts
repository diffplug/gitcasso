import { describe, expect, it, vi } from 'vitest'
import { EnhancerRegistry } from '../../../src/lib/registries'
import { PAGES } from '../../har-index'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseHTML } from 'linkedom'

vi.stubGlobal('defineContentScript', vi.fn())

vi.mock('../../../src/overtype/overtype', () => {
  const mockConstructor = vi.fn().mockImplementation(() => [{
    container: document.createElement('div'),
    wrapper: document.createElement('div'),
    textarea: document.createElement('textarea'),
    preview: document.createElement('div'),
    getValue: vi.fn(() => ''),
    setValue: vi.fn(),
    focus: vi.fn(),
    destroy: vi.fn()
  }])
  mockConstructor.setCodeHighlighter = vi.fn()
  return {
    default: mockConstructor
  }
})

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function loadHtmlFromHar(key: string): Promise<string> {
  const harPath = path.join(__dirname, '../../har', `${key}.har`)
  const harContent = await fs.readFile(harPath, 'utf-8')
  const harData = JSON.parse(harContent)

  const mainEntry = harData.log.entries.find((entry: any) => 
    entry.request.url.includes('github.com') && 
    entry.response.content.mimeType?.includes('text/html') &&
    entry.response.content.text
  )

  if (!mainEntry) {
    throw new Error(`No HTML content found in HAR file: ${key}.har`)
  }

  let html = mainEntry.response.content.text
  
  // Check if content is base64 encoded
  if (mainEntry.response.content.encoding === 'base64') {
    html = Buffer.from(html, 'base64').toString('utf-8')
  }

  return html
}

describe('github', () => {
  it('should identify gh_pr textarea and create proper spot object', async () => {
    const html = await loadHtmlFromHar('gh_pr')
    
    // Parse HTML with linkedom
    const dom = parseHTML(html)
    
    // Replace global document with parsed one
    Object.assign(globalThis, {
      document: dom.document,
      window: {
        ...dom.window,
        location: new URL(PAGES.gh_pr)
      }
    })
    
    const enhancers = new EnhancerRegistry()
    const textareas = document.querySelectorAll('textarea')
    
    let enhanced: any = null
    for (const textarea of textareas) {
      enhanced = enhancers.tryToEnhance(textarea as HTMLTextAreaElement)
      if (enhanced) break
    }
    
    expect(enhanced).toBeTruthy()
    expect(enhanced.spot).toMatchInlineSnapshot(`
      {
        "domain": "github.com",
        "number": 517,
        "slug": "diffplug/selfie",
        "type": "GH_PR_ADD_COMMENT",
        "unique_key": "github.com:diffplug/selfie:517",
      }
    `)
  })
})
