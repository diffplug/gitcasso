import { describe, expect, usingHar } from '../../fixture-har'

// must import fixture **first** for mocks, the `expect` keeps biome from changing sort-order
expect

import { EnhancerRegistry } from '../../../src/lib/registries'

describe('github', () => {
  usingHar('gh_pr').it('should create the correct spot object', async () => {
    const enhancers = new EnhancerRegistry()
    const textareas = document.querySelectorAll('textarea')
    expect(textareas.length).toBe(2)
    expect(enhancers.tryToEnhance(textareas[0]!)).toBeNull()
    expect(enhancers.tryToEnhance(textareas[1]!)?.spot).toMatchInlineSnapshot(`
      {
        "domain": "github.com",
        "number": 517,
        "slug": "diffplug/selfie",
        "type": "GH_PR_ADD_COMMENT",
        "unique_key": "github.com:diffplug/selfie:517",
      }
    `)
  })
  usingHar('gh_issue').it('should create the correct spot object', async () => {
    const enhancers = new EnhancerRegistry()
    const textareas = document.querySelectorAll('textarea')
    expect(textareas.length).toBe(1)
    expect(enhancers.tryToEnhance(textareas[0]!)?.spot).toMatchInlineSnapshot(`
      {
        "domain": "github.com",
        "number": 523,
        "slug": "diffplug/selfie",
        "type": "GH_ISSUE_ADD_COMMENT",
        "unique_key": "github.com:diffplug/selfie:523",
      }
    `)
  })
})
