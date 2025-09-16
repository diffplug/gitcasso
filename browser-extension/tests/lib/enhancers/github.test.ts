import { describe, expect, usingHar } from '../../har-fixture'

// must import fixture **first** for mocks, the `expect` keeps biome from changing sort-order
expect

import { EnhancerRegistry } from '../../../src/lib/registries'

describe('github', () => {
  usingHar('gh_pr').it('should create the correct spot object', async () => {
    const enhancers = new EnhancerRegistry()
    const textareas = document.querySelectorAll('textarea')
    expect(textareas.length).toBe(2)
    expect(enhancers.tryToEnhance(textareas[0]!)).toBeNull()
    const enhancedTextarea = enhancers.tryToEnhance(textareas[1]!)
    expect(enhancedTextarea?.spot).toMatchInlineSnapshot(`
      {
        "domain": "github.com",
        "number": 517,
        "slug": "diffplug/selfie",
        "title": "TODO_TITLE",
        "type": "GH_PR_ADD_COMMENT",
        "unique_key": "github.com:diffplug/selfie:517",
      }
    `)
    expect(
      enhancedTextarea?.enhancer.tableUpperDecoration(enhancedTextarea.spot),
    ).toMatchInlineSnapshot(`
      <React.Fragment>
        <span
          className="font-mono text-muted-foreground text-sm"
        >
          diffplug/selfie
        </span>
        <span
          className="ml-2 font-medium"
        >
          PR #
          517
        </span>
      </React.Fragment>
    `)
  })
  usingHar('gh_new_pr').it('should create the correct spot object', async () => {
    const enhancers = new EnhancerRegistry()
    const textareas = document.querySelectorAll('textarea')
    expect(textareas.length).toBe(2)
    expect(enhancers.tryToEnhance(textareas[0]!)?.spot).toMatchInlineSnapshot(`
          {
            "domain": "github.com",
            "slug": "diffplug/selfie/main...cavia-porcellus:selfie:main",
            "type": "GH_PR_NEW_COMMENT",
            "unique_key": "github.com:diffplug/selfie/main...cavia-porcellus:selfie:main",
          }
        `)
  })
  usingHar('gh_issue').it('should create the correct spot object', async () => {
    const enhancers = new EnhancerRegistry()
    const textareas = document.querySelectorAll('textarea')
    expect(textareas.length).toBe(1)
    const enhancedTextarea = enhancers.tryToEnhance(textareas[0]!)
    expect(enhancedTextarea?.spot).toMatchInlineSnapshot(`
      {
        "domain": "github.com",
        "number": 523,
        "slug": "diffplug/selfie",
        "title": "TODO_TITLE",
        "type": "GH_ISSUE_ADD_COMMENT",
        "unique_key": "github.com:diffplug/selfie:523",
      }
    `)
    // Test the tableRow method
    expect(
      enhancedTextarea?.enhancer.tableUpperDecoration(enhancedTextarea.spot),
    ).toMatchInlineSnapshot(`
      <React.Fragment>
        <span
          className="flex h-4 w-4 flex-shrink-0 items-center justify-center"
        >
          <IssueOpenedIcon
            size={16}
          />
        </span>
        #
        523
        <a
          className="truncate hover:underline"
          href="https://github.com/diffplug/selfie"
        >
          diffplug/selfie
        </a>
      </React.Fragment>
    `)
  })
  usingHar('gh_new_issue').it('should create the correct spot object', async () => {
    const enhancers = new EnhancerRegistry()
    const textareas = document.querySelectorAll('textarea')
    expect(textareas.length).toBe(1)
    expect(enhancers.tryToEnhance(textareas[0]!)?.spot).toMatchInlineSnapshot(`
          {
            "domain": "github.com",
            "slug": "diffplug/selfie",
            "type": "GH_ISSUE_NEW_COMMENT",
            "unique_key": "github.com:diffplug/selfie:new",
          }
        `)
  })
})
