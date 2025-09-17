import OverType, { type OverTypeInstance } from 'overtype'
import type React from 'react'
import type { CommentEnhancer, CommentSpot, StrippedLocation } from '@/lib/enhancer'
import { logger } from '@/lib/logger'
import { modifyDOM } from '../modifyDOM'
import { commonGithubOptions } from './ghOptions'
import { githubHighlighter } from './githubHighlighter'

export interface GitHubPRAddCommentSpot extends CommentSpot {
  type: 'GH_PR_ADD_COMMENT' // Override to narrow from string to specific union
  title: string
  domain: string
  slug: string // owner/repo
  number: number // issue/PR number, undefined for new issues and PRs
}

export class GitHubPRAddCommentEnhancer implements CommentEnhancer<GitHubPRAddCommentSpot> {
  forSpotTypes(): string[] {
    return ['GH_PR_ADD_COMMENT']
  }

  tryToEnhance(
    _textarea: HTMLTextAreaElement,
    location: StrippedLocation,
  ): GitHubPRAddCommentSpot | null {
    // Only handle github.com domains TODO: identify GitHub Enterprise somehow
    if (location.domain !== 'github.com' || _textarea.id !== 'new_comment_field') {
      return null
    }

    // Parse GitHub URL structure: /owner/repo/issues/123 or /owner/repo/pull/456
    logger.debug(`${this.constructor.name} examing url`, location.pathname)

    const match = location.pathname.match(/^\/([^/]+)\/([^/]+)(?:\/pull\/(\d+))/)
    logger.debug(`${this.constructor.name} found match`, location.pathname)
    if (!match) return null
    const [, owner, repo, numberStr] = match
    const slug = `${owner}/${repo}`
    const number = parseInt(numberStr!, 10)
    const unique_key = `github.com:${slug}:${number}`
    const title = 'TODO_TITLE'
    return {
      domain: location.domain,
      number,
      slug,
      title,
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
      ...commonGithubOptions,
      minHeight: '102px',
      padding: 'var(--base-size-8)',
      placeholder: 'Add your comment here...',
    })[0]!
  }

  tableUpperDecoration(spot: GitHubPRAddCommentSpot): React.ReactNode {
    const { slug, number } = spot
    return (
      <>
        <span className='font-mono text-muted-foreground text-sm'>{slug}</span>
        <span className='ml-2 font-medium'>PR #{number}</span>
      </>
    )
  }

  tableTitle(_spot: GitHubPRAddCommentSpot): string {
    return 'TITLE_TODO'
  }
}
