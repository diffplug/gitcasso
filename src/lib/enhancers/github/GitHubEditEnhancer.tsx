import OverType, { type OverTypeInstance } from "overtype"
import type React from "react"
import type {
  CommentEnhancer,
  CommentSpot,
  StrippedLocation,
} from "@/lib/enhancer"
import { logger } from "@/lib/logger"
import { fixupOvertype, modifyDOM } from "../overtype-misc"
import {
  commonGitHubOptions,
  isGitHubProjectUrl,
  isInProjectCommentBox,
  parseProjectIssueParam,
  prepareGitHubHighlighter,
} from "./github-common"

const GH_EDIT = "GH_EDIT" as const

export interface GitHubEditSpot extends CommentSpot {
  isIssue: boolean
  type: typeof GH_EDIT
}

export class GitHubEditEnhancer implements CommentEnhancer<GitHubEditSpot> {
  forSpotTypes(): string[] {
    return [GH_EDIT]
  }

  tryToEnhance(
    textarea: HTMLTextAreaElement,
    location: StrippedLocation
  ): GitHubEditSpot | null {
    if (location.host !== "github.com") {
      return null
    }

    // Check for project draft edit first
    if (isGitHubProjectUrl(location.pathname)) {
      const params = new URLSearchParams(location.search)
      const itemId = params.get("itemId")

      // Handle draft editing (itemId parameter)
      if (itemId) {
        // Exclude textareas within Shared-module__CommentBox (those are for adding new comments, not editing)
        if (!isInProjectCommentBox(textarea)) {
          const unique_key = `github.com:project-draft:${itemId}:edit-body`
          logger.debug(
            `${this.constructor.name} enhanced project draft body textarea`,
            unique_key
          )
          return {
            isIssue: true,
            type: GH_EDIT,
            unique_key,
          }
        }
      }

      // Handle existing issue comment editing (issue parameter)
      const issueInfo = parseProjectIssueParam(params)
      if (issueInfo) {
        // Edit mode: empty placeholder
        // Add new comment mode: has placeholder "Add your comment here..." or similar
        if (!textarea.placeholder || textarea.placeholder.trim() === "") {
          const unique_key = `github.com:${issueInfo.slug}:${issueInfo.number}:edit-comment`
          logger.debug(
            `${this.constructor.name} enhanced project issue comment edit textarea`,
            unique_key
          )
          return {
            isIssue: true,
            type: GH_EDIT,
            unique_key,
          }
        }
      }

      return null
    }

    // Parse GitHub URL structure: /owner/repo/issues/123 or /owner/repo/pull/456
    const match = location.pathname.match(
      /^\/([^/]+)\/([^/]+)\/(?:issues|pull)\/(\d+)/
    )
    if (!match) {
      return null
    }
    const [, owner, repo, numberStr] = match
    const number = parseInt(numberStr!, 10)
    const unique_key = `github.com:${owner}/${repo}:${number}:edit-body`

    // Only enhance textareas that are for editing issue/PR body
    const isIssueBodyRootEdit = textarea.closest(".react-issue-body")
    const isIssueBodyCommentEdit = textarea.closest(
      "[data-wrapper-timeline-id]"
    )
    const isPRBodyEdit =
      textarea.name === "pull_request[body]" || // this is the root pr comment
      textarea.name === "issue_comment[body]" // this is the other pr comments (surprising!)

    if (!isIssueBodyRootEdit && !isIssueBodyCommentEdit && !isPRBodyEdit) {
      return null
    }

    logger.debug(
      `${this.constructor.name} enhanced issue/PR body textarea`,
      unique_key
    )
    return {
      isIssue: !!(isIssueBodyRootEdit || isIssueBodyCommentEdit),
      type: GH_EDIT,
      unique_key,
    }
  }

  enhance(
    textArea: HTMLTextAreaElement,
    spot: GitHubEditSpot
  ): OverTypeInstance {
    prepareGitHubHighlighter()
    const overtypeContainer = modifyDOM(textArea)
    const overtype = fixupOvertype(
      new OverType(overtypeContainer, {
        ...commonGitHubOptions,
        padding: spot.isIssue ? "var(--base-size-16)" : "var(--base-size-8)",
      })
    )
    return overtype
  }

  tableUpperDecoration(_spot: GitHubEditSpot): React.ReactNode {
    return <span>N/A</span>
  }

  tableTitle(_spot: GitHubEditSpot): string {
    return "N/A"
  }
}
