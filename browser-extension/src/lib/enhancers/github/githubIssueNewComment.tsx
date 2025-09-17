import OverType, { type OverTypeInstance } from 'overtype'
import type { CommentEnhancer, CommentSpot, StrippedLocation } from '../../enhancer'
import { logger } from '../../logger'
import { modifyDOM } from '../modifyDOM'
import { commonGithubOptions } from './ghOptions'
import { githubHighlighter } from './githubHighlighter'

interface GitHubIssueNewCommentSpot extends CommentSpot {
  type: 'GH_ISSUE_NEW_COMMENT'
  domain: string
  slug: string // owner/repo
}

export class GitHubIssueNewCommentEnhancer implements CommentEnhancer<GitHubIssueNewCommentSpot> {
  forSpotTypes(): string[] {
    return ['GH_ISSUE_NEW_COMMENT']
  }

  tryToEnhance(
    _textarea: HTMLTextAreaElement,
    location: StrippedLocation,
  ): GitHubIssueNewCommentSpot | null {
    if (location.domain !== 'github.com') {
      return null
    }

    // Parse GitHub URL structure: /owner/repo/issues/123 or /owner/repo/pull/456
    logger.debug(`${this.constructor.name} examing url`, location.pathname)

    const match = location.pathname.match(/^\/([^/]+)\/([^/]+)(?:\/issues\/new)/)
    logger.debug(`${this.constructor.name} found match`, location.pathname)

    if (!match) return null
    const [, owner, repo] = match
    const slug = `${owner}/${repo}`
    const unique_key = `github.com:${slug}:new`
    return {
      domain: location.domain,
      slug,
      type: 'GH_ISSUE_NEW_COMMENT',
      unique_key,
    }
  }

  prepareForFirstEnhancement(): void {
    OverType.setCodeHighlighter(githubHighlighter)
  }

  enhance(textArea: HTMLTextAreaElement, _spot: GitHubIssueNewCommentSpot): OverTypeInstance {
    const overtypeContainer = modifyDOM(textArea)
    return new OverType(overtypeContainer, {
      ...commonGithubOptions,
      minHeight: '400px',
      placeholder: 'Type your description here...',
    })[0]!
  }

  tableUpperDecoration(spot: GitHubIssueNewCommentSpot): React.ReactNode {
    const { slug } = spot
    return (
      <>
        <span>New Issue</span>
        <span className='font-mono text-muted-foreground text-sm'> {slug} </span>
      </>
    )
  }

  tableTitle(_spot: GitHubIssueNewCommentSpot): string {
    return 'New Issue'
  }

  buildUrl(spot: GitHubIssueNewCommentSpot): string {
    return `https://${spot.domain}/${spot.slug}/issue/new`
  }
}
