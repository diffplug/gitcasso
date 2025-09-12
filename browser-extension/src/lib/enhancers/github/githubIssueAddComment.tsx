import OverType, { type OverTypeInstance } from 'overtype'
import type React from 'react'
import type { CommentEnhancer, CommentSpot } from '@/lib/enhancer'
import { logger } from '@/lib/logger'
import { modifyDOM } from '../modifyDOM'
import { githubHighlighter } from './githubHighlighter'

export interface GitHubIssueAddCommentSpot extends CommentSpot {
  type: 'GH_ISSUE_ADD_COMMENT'
  title: string
  domain: string
  slug: string // owner/repo
  number: number // issue number, undefined for new issues
}

export class GitHubIssueAddCommentEnhancer implements CommentEnhancer<GitHubIssueAddCommentSpot> {
  forSpotTypes(): string[] {
    return ['GH_ISSUE_ADD_COMMENT']
  }

  tryToEnhance(_textarea: HTMLTextAreaElement): GitHubIssueAddCommentSpot | null {
    if (document.querySelector('meta[name="hostname"]')?.getAttribute('content') !== 'github.com') {
      return null
    }

    // Parse GitHub URL structure: /owner/repo/issues/123 or /owner/repo/pull/456
    logger.debug(`${this.constructor.name} examing url`, window.location.pathname)

    const match = window.location.pathname.match(/^\/([^/]+)\/([^/]+)(?:\/issues\/(\d+))/)
    logger.debug(`${this.constructor.name} found match`, window.location.pathname)
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
      type: 'GH_ISSUE_ADD_COMMENT',
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
      minHeight: '100px',
      padding: 'var(--base-size-16)',
      placeholder: 'Use Markdown to format your comment',
    })[0]!
  }

  tableRow(spot: GitHubIssueAddCommentSpot): React.ReactNode {
    const { slug, number } = spot
    return (
      <span>
        <span className='font-mono text-sm text-muted-foreground'>{slug}</span>
        <span className='ml-2 font-medium'>Issue #{number}</span>
      </span>
    )
  }
}
