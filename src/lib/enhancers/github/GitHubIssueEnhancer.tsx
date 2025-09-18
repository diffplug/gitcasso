import { IssueOpenedIcon } from '@primer/octicons-react'
import OverType, { type OverTypeInstance } from 'overtype'
import type React from 'react'
import type { CommentEnhancer, CommentSpot, StrippedLocation } from '@/lib/enhancer'
import { logger } from '@/lib/logger'
import { modifyDOM } from '../modifyDOM'
import { commonGithubOptions, prepareGitHubHighlighter } from './github-common'

const GH_ISSUE = 'GH_ISSUE' as const

export interface GitHubIssueSpot extends CommentSpot {
  type: typeof GH_ISSUE
  title: string
  domain: string
  slug: string // owner/repo
  number: number // issue number, undefined for new issues
}

export class GitHubIssueEnhancer implements CommentEnhancer<GitHubIssueSpot> {
  forSpotTypes(): string[] {
    return [GH_ISSUE]
  }

  tryToEnhance(textarea: HTMLTextAreaElement, location: StrippedLocation): GitHubIssueSpot | null {
    if (textarea.id === 'feedback') {
      return null
    }
    if (location.host !== 'github.com') {
      return null
    }

    // Don't enhance textareas that are within the issue/PR body editing container
    const bodyContainer = textarea.closest('.react-issue-body')
    if (bodyContainer) {
      return null
    }

    // Parse GitHub URL structure: /owner/repo/issues/123 or /owner/repo/pull/456
    logger.debug(`${this.constructor.name} examing url`, location.pathname)

    const match = location.pathname.match(/^\/([^/]+)\/([^/]+)(?:\/issues\/(\d+))/)
    logger.debug(`${this.constructor.name} found match`, location.pathname)
    if (!match) return null

    const [, owner, repo, numberStr] = match
    const slug = `${owner}/${repo}`
    const number = parseInt(numberStr!, 10)
    const unique_key = `github.com:${slug}:${number}`
    const title = document
      .querySelector('main h1')!
      .textContent.replace(/\s*#\d+$/, '')
      .trim()
    return {
      domain: location.host,
      number,
      slug,
      title,
      type: GH_ISSUE,
      unique_key,
    }
  }

  enhance(textArea: HTMLTextAreaElement, _spot: GitHubIssueSpot): OverTypeInstance {
    prepareGitHubHighlighter()
    const overtypeContainer = modifyDOM(textArea)
    return new OverType(overtypeContainer, {
      ...commonGithubOptions,
      minHeight: '100px',
      placeholder: 'Use Markdown to format your comment',
    })[0]!
  }

  tableUpperDecoration(spot: GitHubIssueSpot): React.ReactNode {
    return (
      <>
        <span className='flex h-4 w-4 flex-shrink-0 items-center justify-center'>
          <IssueOpenedIcon size={16} />
        </span>
        #{spot.number}
        <a href={`https://${spot.domain}/${spot.slug}`} className='truncate hover:underline'>
          {spot.slug}
        </a>
      </>
    )
  }

  tableTitle(spot: GitHubIssueSpot): string {
    return spot.title
  }
}
