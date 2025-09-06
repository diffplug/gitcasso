import { vi } from 'vitest'
import { EnhancerRegistry } from '../../../src/lib/registries'
import { describe, expect, usingHar } from '../../test-fixtures'

vi.stubGlobal('defineContentScript', vi.fn())
vi.mock('../../../src/overtype/overtype', () => {
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

describe('github', () => {
  usingHar('gh_pr').it('should identify gh_pr textarea and create proper spot object', async () => {
    const enhancers = new EnhancerRegistry()
    const textareas = document.querySelectorAll('textarea')

    let enhanced: ReturnType<EnhancerRegistry['tryToEnhance']> = null
    for (const textarea of textareas) {
      enhanced = enhancers.tryToEnhance(textarea as HTMLTextAreaElement)
      if (enhanced) break
    }

    expect(enhanced).toBeTruthy()
    expect(enhanced?.spot).toMatchInlineSnapshot(`
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
