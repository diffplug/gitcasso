import OverType, { type OverTypeInstance } from 'overtype'
import type React from 'react'
import type { CommentEnhancer, CommentSpot } from '@/lib/enhancer'
import { logger } from '@/lib/logger'
import { modifyDOM } from '../modifyDOM'
import { commonGithubOptions } from './ghOptions'
import { githubHighlighter } from './githubHighlighter'

export interface GitHubEditCommentSpot extends CommentSpot {
  type: 'GH_EDIT_COMMENT'
  title: string
  domain: string
  slug: string
  number: number
}

export class GitHubEditCommentEnhancer implements CommentEnhancer<GitHubEditCommentSpot> {
  forSpotTypes(): string[] {
    return ['GH_EDIT_COMMENT']
  }

  tryToEnhance(_textarea: HTMLTextAreaElement): GitHubEditCommentSpot | null {
    if (
      document.querySelector('meta[name="hostname"]')?.getAttribute('content') !== 'github.com' ||
      !_textarea.matches('.TimelineItem textarea')
    ) {
      return null
    }

    // Parse GitHub URL structure: /owner/repo/issues/123 or /owner/repo/pull/456
    logger.info(`${this.constructor.name} examing url`, window.location.pathname)

    const match = window.location.pathname.match(/^\/([^/]+)\/([^/]+)(?:\/(pull|issues)\/(\d+))/)
    logger.info(`${this.constructor.name} found match`, window.location.pathname)
    if (!match) return null
    const [, owner, repo, numberStr] = match
    const slug = `${owner}/${repo}`
    const number = parseInt(numberStr!, 10)
    const unique_key = `github.com:${slug}:${number}`
    const title = 'TODO_TITLE'
    return {
      domain: 'github.com',
      number,
      slug,
      title,
      type: 'GH_EDIT_COMMENT',
      unique_key,
    }
  }

  prepareForFirstEnhancement(): void {
    OverType.setCodeHighlighter(githubHighlighter)
  }

  enhance(textArea: HTMLTextAreaElement, _spot: GitHubEditCommentSpot): OverTypeInstance {
    const overtypeContainer = modifyDOM(textArea)
    return new OverType(overtypeContainer, {
      ...commonGithubOptions,
      minHeight: '102px',
      padding: 'var(--base-size-8)',
      placeholder: 'Add your comment here...',
    })[0]!
  }

  tableUpperDecoration(spot: GitHubEditCommentSpot): React.ReactNode {
    const { slug, number } = spot
    return (
      <>
        <span className='font-mono text-muted-foreground text-sm'>{slug}</span>
        <span className='ml-2 font-medium'>PR #{number}</span>
      </>
    )
  }

  tableTitle(_spot: GitHubEditCommentSpot): string {
    return 'TITLE_TODO'
  }
}
