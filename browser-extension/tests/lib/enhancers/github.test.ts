import { setupCommonMocks } from '../../mock-setup'

setupCommonMocks()

import { EnhancerRegistry } from '../../../src/lib/registries'
import { describe, expect, usingHar } from '../../test-fixtures'

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
