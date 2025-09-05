import OverType, { type OverTypeInstance } from '../../../overtype/overtype'
import type { CommentEnhancer, CommentSpot } from '../../enhancer'
import { logger } from '../../logger'
import { modifyDOM } from '../modifyDOM'
import { githubHighlighter } from './githubHighlighter'

interface GitHubPRAddCommentSpot extends CommentSpot {
  type: 'GH_PR_ADD_COMMENT' // Override to narrow from string to specific union
  domain: string
  slug: string // owner/repo
  number: number // issue/PR number, undefined for new issues and PRs
}

export class GitHubPRAddCommentEnhancer implements CommentEnhancer<GitHubPRAddCommentSpot> {
  forSpotTypes(): string[] {
    return ['GH_PR_ADD_COMMENT']
  }

  tryToEnhance(_textarea: HTMLTextAreaElement): GitHubPRAddCommentSpot | null {
    // Only handle github.com domains TODO: identify GitHub Enterprise somehow
    if (window.location.hostname !== 'github.com' || _textarea.id !== 'new_comment_field') {
      return null
    }

    // Parse GitHub URL structure: /owner/repo/issues/123 or /owner/repo/pull/456
    logger.debug(`${this.constructor.name} examing url`, window.location.pathname)

    const match = window.location.pathname.match(/^\/([^/]+)\/([^/]+)(?:\/pull\/(\d+))/)
    logger.debug(`${this.constructor.name} found match`, window.location.pathname)
    if (!match) return null
    const [, owner, repo, numberStr] = match
    const slug = `${owner}/${repo}`
    const number = parseInt(numberStr!, 10)
    const unique_key = `github.com:${slug}:${number}`
    return {
      domain: 'github.com',
      number,
      slug,
      type: 'GH_PR_ADD_COMMENT',
      unique_key,
    }
  }

  prepareForFirstEnhancement(): void {
    OverType.setCodeHighlighter(githubHighlighter)
  }

  enhance(textArea: HTMLTextAreaElement, _spot: GitHubPRAddCommentSpot): OverTypeInstance {
    const overtypeContainer = modifyDOM(textArea)
    return new OverType(overtypeContainer, {
      autoResize: true,
      minHeight: '102px',
      padding: 'var(--base-size-8)',
      placeholder: 'Add your comment here...',
    })[0]!
  }

  tableTitle(spot: GitHubPRAddCommentSpot): string {
    const { slug, number } = spot
    return `${slug} PR #${number}`
  }

  tableIcon(_: GitHubPRAddCommentSpot): string {
    return '🔄' // PR icon TODO: icon urls in /public
  }

  buildUrl(spot: GitHubPRAddCommentSpot): string {
    return `https://${spot.domain}/${spot.slug}/pull/${spot.number}`
  }
}
