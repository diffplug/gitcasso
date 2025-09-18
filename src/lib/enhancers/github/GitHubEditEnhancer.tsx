import OverType, { type OverTypeInstance } from 'overtype'
import type React from 'react'
import type { CommentEnhancer, CommentSpot, StrippedLocation } from '@/lib/enhancer'
import { logger } from '@/lib/logger'
import { modifyDOM } from '../modifyDOM'
import { commonGithubOptions, prepareGitHubHighlighter } from './github-common'

const GH_EDIT = 'GH_EDIT' as const

export interface GitHubEditSpot extends CommentSpot {
  type: typeof GH_EDIT
}

export class GitHubEditEnhancer implements CommentEnhancer<GitHubEditSpot> {
  forSpotTypes(): string[] {
    return [GH_EDIT]
  }

  tryToEnhance(textarea: HTMLTextAreaElement, location: StrippedLocation): GitHubEditSpot | null {
    if (location.host !== 'github.com') {
      return null
    }

    // Only enhance textareas that are for editing issue/PR body
    const isIssueBodyEdit = textarea.closest('.react-issue-body')
    const isPRBodyEdit =
      textarea.id?.match(/^issue-\d+-body$/) || textarea.name === 'pull_request[body]'

    if (!isIssueBodyEdit && !isPRBodyEdit) {
      return null
    }

    // Parse GitHub URL structure: /owner/repo/issues/123 or /owner/repo/pull/456
    const match = location.pathname.match(/^\/([^/]+)\/([^/]+)\/(?:issues|pull)\/(\d+)/)
    if (!match) {
      return null
    }

    const [, owner, repo, numberStr] = match
    const number = parseInt(numberStr!, 10)
    const unique_key = `github.com:${owner}/${repo}:${number}:edit-body`

    logger.debug(`${this.constructor.name} enhanced issue/PR body textarea`, unique_key)
    return {
      type: GH_EDIT,
      unique_key,
    }
  }

  enhance(textArea: HTMLTextAreaElement, _spot: GitHubEditSpot): OverTypeInstance {
    prepareGitHubHighlighter()
    const overtypeContainer = modifyDOM(textArea)
    return new OverType(overtypeContainer, {
      ...commonGithubOptions,
      minHeight: '102px',
      padding: 'var(--base-size-8)',
      placeholder: 'Add your comment here...',
    })[0]!
  }

  tableUpperDecoration(_spot: GitHubEditSpot): React.ReactNode {
    return <span>N/A</span>
  }

  tableTitle(_spot: GitHubEditSpot): string {
    return 'N/A'
  }
}
