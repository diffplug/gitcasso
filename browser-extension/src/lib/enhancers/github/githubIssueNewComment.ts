import OverType, { type OverTypeInstance } from 'overtype'
import type { CommentEnhancer, CommentSpot } from '../../enhancer'
import { logger } from '../../logger'
import { modifyDOM } from '../modifyDOM'
import { githubHighlighter } from './githubHighlighter'

interface GitHubIssueAddCommentSpot extends CommentSpot {
  type: 'GH_ISSUE_NEW_COMMENT'
  domain: string
  slug: string // owner/repo
}

export class GitHubIssueNewCommentEnhancer implements CommentEnhancer<GitHubIssueAddCommentSpot> {
  forSpotTypes(): string[] {
    return ['GH_ISSUE_NEW_COMMENT']
  }

  tryToEnhance(_textarea: HTMLTextAreaElement): GitHubIssueAddCommentSpot | null {
    if (document.querySelector('meta[name="hostname"]')?.getAttribute('content') !== 'github.com') {
      return null
    }

    // Parse GitHub URL structure: /owner/repo/issues/123 or /owner/repo/pull/456
    logger.info(`${this.constructor.name} examing url`, window.location.pathname)

    const match = window.location.pathname.match(/^\/([^/]+)\/([^/]+)(?:\/issues\/new)/)
    logger.info(`${this.constructor.name} found match`, window.location.pathname)

    if (!match) return null
    const [, owner, repo] = match
    const slug = `${owner}/${repo}`
    const unique_key = `github.com:${slug}:new`
    return {
      domain: 'github.com',
      slug,
      type: 'GH_ISSUE_NEW_COMMENT',
      unique_key,
    }
  }

  prepareForFirstEnhancement(): void {
    OverType.setCodeHighlighter(githubHighlighter)
  }

  enhance(textArea: HTMLTextAreaElement, _spot: GitHubIssueAddCommentSpot): OverTypeInstance {
    const overtypeContainer = modifyDOM(textArea)
    return new OverType(overtypeContainer, {
      autoResize: true,
      minHeight: '400px',
      padding: 'var(--base-size-16)',
      placeholder: 'Type your description here...',
    })[0]!
  }

  tableTitle(spot: GitHubIssueAddCommentSpot): string {
    const { slug } = spot
    return `${slug} New Issue`
  }

  tableIcon(_: GitHubIssueAddCommentSpot): string {
    return '🔄' // PR icon TODO: icon urls in /public
  }

  buildUrl(spot: GitHubIssueAddCommentSpot): string {
    return `https://${spot.domain}/${spot.slug}/issue/new`
  }
}
