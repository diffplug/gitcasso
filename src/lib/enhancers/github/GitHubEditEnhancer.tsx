import OverType, { type OverTypeInstance } from 'overtype'
import type React from 'react'
import type { CommentEnhancer, CommentSpot, StrippedLocation } from '@/lib/enhancer'
import { logger } from '@/lib/logger'
import { modifyDOM } from '../modifyDOM'
import { commonGitHubOptions, prepareGitHubHighlighter } from './github-common'

const GH_EDIT = 'GH_EDIT' as const

export interface GitHubEditSpot extends CommentSpot {
  isIssue: boolean
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
    const isIssueBodyEdit = textarea.closest('.react-issue-body') // this works for root and appended comments
    const isPRBodyEdit =
      textarea.name === 'pull_request[body]' || textarea.name === 'issue_comment[body]'
    //                   ^this is the root pr comment              ^this is the other pr comments (surprising!)

    // Also detect comment editing textareas (have "Update comment" button)
    // Look for "Update comment" button in the same container as the textarea
    const container =
      textarea.closest('[class*="markdown"], [class*="comment"], .js-comment-edit-form') ||
      textarea.closest('form') ||
      textarea.parentElement?.parentElement?.parentElement
    const buttons = container ? Array.from(container.querySelectorAll('button')) : []
    const isCommentEdit = buttons.some((btn) => btn.textContent?.includes('Update comment'))

    if (!isIssueBodyEdit && !isPRBodyEdit && !isCommentEdit) {
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
      isIssue: !!isIssueBodyEdit,
      type: GH_EDIT,
      unique_key,
    }
  }

  enhance(textArea: HTMLTextAreaElement, spot: GitHubEditSpot): OverTypeInstance {
    prepareGitHubHighlighter()
    const overtypeContainer = modifyDOM(textArea)
    const overtype = new OverType(overtypeContainer, {
      ...commonGitHubOptions,
      padding: spot.isIssue ? 'var(--base-size-16)' : 'var(--base-size-8)',
    })[0]!
    if (!spot.isIssue) {
      // TODO: autoheight not working
    }
    return overtype
  }

  tableUpperDecoration(_spot: GitHubEditSpot): React.ReactNode {
    return <span>N/A</span>
  }

  tableTitle(_spot: GitHubEditSpot): string {
    return 'N/A'
  }
}
