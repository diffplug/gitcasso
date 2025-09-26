import OverType from 'overtype'
import type React from 'react'
import type {
  CommentEnhancer,
  CommentSpot,
  OvertypeWithCleanup,
  StrippedLocation,
} from '@/lib/enhancer'
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

    // Parse GitHub URL structure: /owner/repo/issues/123 or /owner/repo/pull/456
    const match = location.pathname.match(/^\/([^/]+)\/([^/]+)\/(?:issues|pull)\/(\d+)/)
    if (!match) {
      return null
    }
    const [, owner, repo, numberStr] = match
    const number = parseInt(numberStr!, 10)
    const unique_key = `github.com:${owner}/${repo}:${number}:edit-body`

    // Only enhance textareas that are for editing issue/PR body
    const isIssueBodyRootEdit = textarea.closest('.react-issue-body')
    const isIssueBodyCommentEdit = textarea.closest('[data-wrapper-timeline-id]')
    const isPRBodyEdit =
      textarea.name === 'pull_request[body]' || textarea.name === 'issue_comment[body]'
    //                   ^this is the root pr comment              ^this is the other pr comments (surprising!)

    if (!isIssueBodyRootEdit && !isIssueBodyCommentEdit && !isPRBodyEdit) {
      return null
    }

    logger.debug(`${this.constructor.name} enhanced issue/PR body textarea`, unique_key)
    return {
      isIssue: !!(isIssueBodyRootEdit || isIssueBodyCommentEdit),
      type: GH_EDIT,
      unique_key,
    }
  }

  enhance(textArea: HTMLTextAreaElement, spot: GitHubEditSpot): OvertypeWithCleanup {
    prepareGitHubHighlighter()
    const overtypeContainer = modifyDOM(textArea)
    const overtype = new OverType(overtypeContainer, {
      ...commonGitHubOptions,
      padding: spot.isIssue ? 'var(--base-size-16)' : 'var(--base-size-8)',
    })[0]!
    if (!spot.isIssue) {
      // TODO: autoheight not working
    }
    return { instance: overtype }
  }

  tableUpperDecoration(_spot: GitHubEditSpot): React.ReactNode {
    return <span>N/A</span>
  }

  tableTitle(_spot: GitHubEditSpot): string {
    return 'N/A'
  }
}
