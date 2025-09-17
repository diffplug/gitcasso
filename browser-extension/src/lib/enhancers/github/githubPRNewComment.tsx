import OverType, { type OverTypeInstance } from 'overtype'
import type { CommentEnhancer, CommentSpot, StrippedLocation } from '../../enhancer'
import { logger } from '../../logger'
import { modifyDOM } from '../modifyDOM'
import { commonGithubOptions } from './ghOptions'
import { githubHighlighter } from './githubHighlighter'

interface GitHubPRNewCommentSpot extends CommentSpot {
  type: 'GH_PR_NEW_COMMENT'
  domain: string
  slug: string // owner/repo/base-branch/compare-branch
}

export class GitHubPRNewCommentEnhancer implements CommentEnhancer<GitHubPRNewCommentSpot> {
  forSpotTypes(): string[] {
    return ['GH_PR_NEW_COMMENT']
  }

  tryToEnhance(
    textarea: HTMLTextAreaElement,
    location: StrippedLocation,
  ): GitHubPRNewCommentSpot | null {
    if (textarea.id === 'feedback') {
      return null
    }
    if (location.host !== 'github.com') {
      return null
    }

    // /owner/repo/compare/feature/more-enhancers?expand=1
    // or /owner/repo/compare/feat/issue-static-and-dynamic...feature/more-enhancers?expand=1
    logger.info(`${this.constructor.name} examing url`, location.pathname)

    const match = location.pathname.match(
      /^\/([^/]+)\/([^/]+)\/compare\/(?:([^.?]+)\.\.\.)?([^?]+)/,
    )
    logger.info(`${this.constructor.name} found match`, location.pathname, match)

    if (!match) return null
    const [, owner, repo, baseBranch, compareBranch] = match
    const slug = baseBranch
      ? `${owner}/${repo}/${baseBranch}...${compareBranch}`
      : `${owner}/${repo}/${compareBranch}`
    const unique_key = `github.com:${slug}`
    return {
      domain: location.host,
      slug,
      type: 'GH_PR_NEW_COMMENT',
      unique_key,
    }
  }

  prepareForFirstEnhancement(): void {
    OverType.setCodeHighlighter(githubHighlighter)
  }

  enhance(textArea: HTMLTextAreaElement, _spot: GitHubPRNewCommentSpot): OverTypeInstance {
    const overtypeContainer = modifyDOM(textArea)
    return new OverType(overtypeContainer, {
      ...commonGithubOptions,
      minHeight: '250px',
      placeholder: 'Type your description here...',
    })[0]!
  }

  tableUpperDecoration(spot: GitHubPRNewCommentSpot): React.ReactNode {
    const { slug } = spot
    return (
      <>
        <span>New PR</span>
        <span className='font-mono text-muted-foreground text-sm'> {slug} </span>
      </>
    )
  }

  tableTitle(_spot: GitHubPRNewCommentSpot): string {
    return 'TITLE_TODO'
  }

  buildUrl(spot: GitHubPRNewCommentSpot): string {
    return `https://${spot.domain}/${spot.slug}/issue/new`
  }
}
