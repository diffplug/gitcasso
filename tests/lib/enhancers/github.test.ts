import { describe, expect, forCorpus as withCorpus } from '../../corpus-fixture'

// must import fixture **first** for mocks, the `expect` keeps biome from changing sort-order
expect

import type { StrippedLocation } from '@/lib/enhancer'
import { EnhancerRegistry } from '../../../src/lib/registries'

const enhancers = new EnhancerRegistry()
function enhancements(document: Document, window: Window) {
  const textareas = document.querySelectorAll('textarea')
  const location: StrippedLocation = {
    host: window.location.host,
    pathname: window.location.pathname,
  }
  const spotsFound = []
  for (const textarea of textareas) {
    const enhanced = enhancers.tryToEnhance(textarea, location)
    const forValue = `id=${textarea.id} name=${textarea.name} className=${textarea.className}`
    if (enhanced) {
      spotsFound.push({
        for: forValue,
        spot: enhanced.spot,
        title: enhanced.enhancer.tableTitle(enhanced.spot),
        upperDecoration: enhanced.enhancer.tableUpperDecoration(enhanced.spot),
      })
    } else {
      spotsFound.push({
        for: forValue,
        spot: 'NO_SPOT',
      })
    }
  }
  return spotsFound
}

describe('github', () => {
  withCorpus('gh_pr').it('should create the correct spot object', async () => {
    expect(enhancements(document, window)).toMatchInlineSnapshot(`
      [
        {
          "for": "id=feedback name=feedback className=form-control width-full mb-2",
          "spot": "NO_SPOT",
        },
        {
          "for": "id=new_comment_field name=comment[body] className=js-comment-field js-paste-markdown js-task-list-field js-quick-submit FormControl-textarea CommentBox-input js-size-to-fit size-to-fit js-session-resumable js-saved-reply-shortcut-comment-field overtype-input",
          "spot": {
            "domain": "github.com",
            "number": 517,
            "slug": "diffplug/selfie",
            "title": "TODO_TITLE",
            "type": "GH_PR_ADD_COMMENT",
            "unique_key": "github.com:diffplug/selfie:517",
          },
          "title": "TITLE_TODO",
          "upperDecoration": <React.Fragment>
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
          </React.Fragment>,
        },
      ]
    `)
  })
  withCorpus('gh_new_pr').it('should create the correct spot object', async () => {
    expect(enhancements(document, window)).toMatchInlineSnapshot(`
      [
        {
          "for": "id=feedback name=feedback className=form-control width-full mb-2",
          "spot": "NO_SPOT",
        },
        {
          "for": "id=pull_request_body name=pull_request[body] className=js-comment-field js-paste-markdown js-task-list-field js-quick-submit FormControl-textarea CommentBox-input js-size-to-fit size-to-fit js-session-resumable js-saved-reply-shortcut-comment-field CommentBox-input--large overtype-input",
          "spot": {
            "domain": "github.com",
            "slug": "diffplug/selfie/main...cavia-porcellus:selfie:main",
            "type": "GH_PR_NEW_COMMENT",
            "unique_key": "github.com:diffplug/selfie/main...cavia-porcellus:selfie:main",
          },
          "title": "TITLE_TODO",
          "upperDecoration": <React.Fragment>
            <span>
              New PR
            </span>
            <span
              className="font-mono text-muted-foreground text-sm"
            >
               
              diffplug/selfie/main...cavia-porcellus:selfie:main
               
            </span>
          </React.Fragment>,
        },
      ]
    `)
  })
  withCorpus('gh_issue').it('no enhancement on initial page load', async () => {
    expect(enhancements(document, window)).toMatchInlineSnapshot(`
      [
        {
          "for": "id=feedback name=feedback className=form-control width-full mb-2",
          "spot": "NO_SPOT",
        },
      ]
    `)
  })
  withCorpus('gh_issue_populated_comment').it('should create the correct spot object', async () => {
    expect(enhancements(document, window)).toMatchInlineSnapshot(`
      [
        {
          "for": "id=:rn: name=null className=prc-Textarea-TextArea-13q4j overtype-input",
          "spot": {
            "domain": "github.com",
            "number": 523,
            "slug": "diffplug/selfie",
            "title": "[jvm] docs for VCR",
            "type": "GH_ISSUE_ADD_COMMENT",
            "unique_key": "github.com:diffplug/selfie:523",
          },
          "title": "[jvm] docs for VCR",
          "upperDecoration": <React.Fragment>
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
          </React.Fragment>,
        },
      ]
    `)
  })
  withCorpus('gh_new_issue').it('should create the correct spot object', async () => {
    expect(enhancements(document, window)).toMatchInlineSnapshot(`
      [
        {
          "for": "id=feedback name=feedback className=form-control width-full mb-2 overtype-input",
          "spot": {
            "domain": "github.com",
            "slug": "diffplug/selfie",
            "type": "GH_ISSUE_NEW_COMMENT",
            "unique_key": "github.com:diffplug/selfie:new",
          },
          "title": "New Issue",
          "upperDecoration": <React.Fragment>
            <span>
              New Issue
            </span>
            <span
              className="font-mono text-muted-foreground text-sm"
            >
               
              diffplug/selfie
               
            </span>
          </React.Fragment>,
        },
      ]
    `)
  })
  withCorpus('gh_issue_edit').it('should create the correct spot object', async () => {
    expect(enhancements(document, window)).toMatchInlineSnapshot(`
      [
        {
          "for": "id=:rc3: name=null className=prc-Textarea-TextArea-13q4j focus-visible overtype-input",
          "spot": {
            "domain": "github.com",
            "number": 56,
            "slug": "diffplug/gitcasso",
            "title": "what about the draft?",
            "type": "GH_ISSUE_ADD_COMMENT",
            "unique_key": "github.com:diffplug/gitcasso:56",
          },
          "title": "what about the draft?",
          "upperDecoration": <React.Fragment>
            <span
              className="flex h-4 w-4 flex-shrink-0 items-center justify-center"
            >
              <IssueOpenedIcon
                size={16}
              />
            </span>
            #
            56
            <a
              className="truncate hover:underline"
              href="https://github.com/diffplug/gitcasso"
            >
              diffplug/gitcasso
            </a>
          </React.Fragment>,
        },
        {
          "for": "id=:ra7: name=null className=prc-Textarea-TextArea-13q4j overtype-input",
          "spot": {
            "domain": "github.com",
            "number": 56,
            "slug": "diffplug/gitcasso",
            "title": "what about the draft?",
            "type": "GH_ISSUE_ADD_COMMENT",
            "unique_key": "github.com:diffplug/gitcasso:56",
          },
          "title": "what about the draft?",
          "upperDecoration": <React.Fragment>
            <span
              className="flex h-4 w-4 flex-shrink-0 items-center justify-center"
            >
              <IssueOpenedIcon
                size={16}
              />
            </span>
            #
            56
            <a
              className="truncate hover:underline"
              href="https://github.com/diffplug/gitcasso"
            >
              diffplug/gitcasso
            </a>
          </React.Fragment>,
        },
      ]
    `)
  })
  withCorpus('gh_pr_edit').it('should create the correct spot object', async () => {
    expect(enhancements(document, window)).toMatchInlineSnapshot(`
      [
        {
          "for": "id=issue-3429313834-body name=pull_request[body] className=js-comment-field js-paste-markdown js-task-list-field js-quick-submit js-size-to-fit size-to-fit js-session-resumable CommentBox-input FormControl-textarea js-saved-reply-shortcut-comment-field focus-visible overtype-input",
          "spot": {
            "domain": "github.com",
            "number": NaN,
            "slug": "diffplug/gitcasso",
            "title": "TODO_TITLE",
            "type": "GH_EDIT_COMMENT",
            "unique_key": "github.com:diffplug/gitcasso:NaN",
          },
          "title": "TITLE_TODO",
          "upperDecoration": <React.Fragment>
            <span
              className="font-mono text-muted-foreground text-sm"
            >
              diffplug/gitcasso
            </span>
            <span
              className="ml-2 font-medium"
            >
              PR #
              NaN
            </span>
          </React.Fragment>,
        },
        {
          "for": "id=new_comment_field name=comment[body] className=js-comment-field js-paste-markdown js-task-list-field js-quick-submit FormControl-textarea CommentBox-input js-size-to-fit size-to-fit js-session-resumable js-saved-reply-shortcut-comment-field overtype-input",
          "spot": {
            "domain": "github.com",
            "number": 58,
            "slug": "diffplug/gitcasso",
            "title": "TODO_TITLE",
            "type": "GH_PR_ADD_COMMENT",
            "unique_key": "github.com:diffplug/gitcasso:58",
          },
          "title": "TITLE_TODO",
          "upperDecoration": <React.Fragment>
            <span
              className="font-mono text-muted-foreground text-sm"
            >
              diffplug/gitcasso
            </span>
            <span
              className="ml-2 font-medium"
            >
              PR #
              58
            </span>
          </React.Fragment>,
        },
      ]
    `)
  })
})
