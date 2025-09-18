import OverType, { type OverTypeInstance } from 'overtype'
import type React from 'react'
import type { CommentEnhancer, CommentSpot, StrippedLocation } from '@/lib/enhancer'
import { logger } from '@/lib/logger'
import { modifyDOM } from '../modifyDOM'
import { commonGithubOptions } from './ghOptions'
import { prepareGitHubHighlighter } from './githubHighlighter'

export interface GitHubEditCommentSpot extends CommentSpot {
  type: 'GH_EDIT_COMMENT'
}

export class GitHubEditCommentEnhancer implements CommentEnhancer<GitHubEditCommentSpot> {
  forSpotTypes(): string[] {
    return ['GH_EDIT_COMMENT']
  }

  tryToEnhance(
    textarea: HTMLTextAreaElement,
    location: StrippedLocation,
  ): GitHubEditCommentSpot | null {
    if (location.host !== 'github.com') {
      return null
    }

    // Only enhance textareas that are within the issue/PR body editing container
    const bodyContainer = textarea.closest('.react-issue-body')
    if (!bodyContainer) {
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
      type: 'GH_EDIT_COMMENT',
      unique_key,
    }
  }

  enhance(textArea: HTMLTextAreaElement, _spot: GitHubEditCommentSpot): OverTypeInstance {
    prepareGitHubHighlighter()
    const overtypeContainer = modifyDOM(textArea)
    return new OverType(overtypeContainer, {
      ...commonGithubOptions,
      minHeight: '102px',
      padding: 'var(--base-size-8)',
      placeholder: 'Add your comment here...',
    })[0]!
  }

  tableUpperDecoration(_spot: GitHubEditCommentSpot): React.ReactNode {
    return <span>N/A</span>
  }

  tableTitle(_spot: GitHubEditCommentSpot): string {
    return 'N/A'
  }
}
