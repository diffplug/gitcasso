import hljs from 'highlight.js'
import { logger } from '../../lib/logger'
import OverType, { type OverTypeInstance } from '../../overtype/overtype'
import type { CommentEnhancer, CommentSpot } from '../enhancer'

const GITHUB_SPOT_TYPES = [
  'GH_PR_ADD_COMMENT',
  'GH_ISSUE_ADD_COMMENT',
  /* TODO
  'GH_ISSUE_NEW',
  'GH_PR_NEW',
  'GH_ISSUE_EDIT_COMMENT',
  'GH_PR_EDIT_COMMENT',
  'GH_PR_CODE_COMMENT',
  */
] as const

export type GitHubSpotType = (typeof GITHUB_SPOT_TYPES)[number]

export interface GitHubAddCommentSpot extends CommentSpot {
  type: GitHubSpotType // Override to narrow from string to specific union
  domain: string
  slug: string // owner/repo
  number: number // issue/PR number, undefined for new issues and PRs
}

export class GitHubAddCommentEnhancer implements CommentEnhancer<GitHubAddCommentSpot> {
  forSpotTypes(): string[] {
    return [...GITHUB_SPOT_TYPES]
  }

  tryToEnhance(textarea: HTMLTextAreaElement): [OverTypeInstance, GitHubAddCommentSpot] | null {
    // Only handle github.com domains TODO: identify GitHub Enterprise somehow
    if (window.location.hostname !== 'github.com') {
      return null
    }

    // Parse GitHub URL structure: /owner/repo/issues/123 or /owner/repo/pull/456
    logger.debug(`${this.constructor.name} examing url`, window.location.pathname)

    const match = window.location.pathname.match(/^\/([^/]+)\/([^/]+)(?:\/(pull|issues)\/(\d+))/)
    logger.debug(`${this.constructor.name} found match`, window.location.pathname)
    if (!match) return null
    const [, owner, repo, issuesOrPull, numberStr] = match
    const type = issuesOrPull === 'issues' ? 'GH_ISSUE_ADD_COMMENT' : 'GH_PR_ADD_COMMENT'
    const slug = `${owner}/${repo}`
    const number = parseInt(numberStr!, 10)

    const unique_key = `github.com:${slug}:${number}`

    const spot: GitHubAddCommentSpot = {
      domain: 'github.com',
      number,
      slug,
      type,
      unique_key,
    }
    return [this.createOvertypeFor(textarea), spot]
  }

  private createOvertypeFor(ghCommentBox: HTMLTextAreaElement): OverTypeInstance {
    OverType.setCodeHighlighter(hljsHighlighter)
    const overtypeContainer = this.modifyDOM(ghCommentBox)
    return new OverType(overtypeContainer, {
      autoResize: true,
      minHeight: '102px',
      padding: 'var(--base-size-8)',
      placeholder: 'Add your comment here...',
    })[0]!
  }

  private modifyDOM(overtypeInput: HTMLTextAreaElement): HTMLElement {
    overtypeInput.classList.add('overtype-input')
    const overtypePreview = document.createElement('div')
    overtypePreview.classList.add('overtype-preview')
    overtypeInput.insertAdjacentElement('afterend', overtypePreview)
    const overtypeWrapper = overtypeInput.parentElement!.closest('div')!
    overtypeWrapper.classList.add('overtype-wrapper')
    overtypeInput.placeholder = 'Add your comment here...'
    const overtypeContainer = overtypeWrapper.parentElement!.closest('div')!
    overtypeContainer.classList.add('overtype-container')
    return overtypeContainer.parentElement!.closest('div')!
  }

  tableTitle(spot: GitHubAddCommentSpot): string {
    const { slug, number } = spot
    return `${slug} PR #${number}`
  }

  tableIcon(_: GitHubAddCommentSpot): string {
    return '🔄' // PR icon TODO: icon urls in /public
  }

  buildUrl(spot: GitHubAddCommentSpot): string {
    return `https://${spot.domain}/${spot.slug}/pull/${spot.number}`
  }
}

function hljsHighlighter(code: string, language: string) {
  try {
    if (language && hljs.getLanguage(language)) {
      const result = hljs.highlight(code, { language })
      return result.value
    } else {
      const result = hljs.highlightAuto(code)
      return result.value
    }
  } catch (error) {
    console.warn('highlight.js highlighting failed:', error)
    return code
  }
}
