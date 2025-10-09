import OverType, { type OverTypeInstance } from "overtype"
import {
  CommentEnhancerNoDraftHistory,
  type CommentSpot,
  DRAFT_STORAGE_UNSUPPORTED,
  type StrippedLocation,
} from "@/lib/enhancer"
import { fixupOvertype, modifyDOM } from "../overtype-misc"
import {
  commonGitHubOptions,
  isInProjectCommentBox,
  isProjectUrl,
  parseProjectIssueParam,
  prepareGitHubHighlighter,
} from "./github-common"

const GH_EDIT = "GH_EDIT" as const

export interface GitHubEditSpot extends CommentSpot {
  isIssue: boolean
  type: typeof GH_EDIT
}

export class GitHubEditEnhancer extends CommentEnhancerNoDraftHistory<GitHubEditSpot> {
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
    if (isProjectUrl(location.pathname)) {
      const params = new URLSearchParams(location.search)
      const itemId = params.get("itemId")

      // Handle draft editing (itemId parameter)
      if (itemId) {
        // Exclude textareas within Shared-module__CommentBox (those are for adding new comments, not editing)
        if (!isInProjectCommentBox(textarea)) {
          return {
            isIssue: true,
            type: GH_EDIT,
            unique_key: DRAFT_STORAGE_UNSUPPORTED,
          }
        }
      }

      // Handle existing issue comment editing (issue parameter)
      const issueInfo = parseProjectIssueParam(params)
      if (issueInfo) {
        // Edit mode: empty placeholder
        // Add new comment mode: has placeholder "Add your comment here..." or similar
        if (!textarea.placeholder || textarea.placeholder.trim() === "") {
          return {
            isIssue: true,
            type: GH_EDIT,
            unique_key: DRAFT_STORAGE_UNSUPPORTED,
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
    return {
      isIssue: !!(isIssueBodyRootEdit || isIssueBodyCommentEdit),
      type: GH_EDIT,
      unique_key: DRAFT_STORAGE_UNSUPPORTED,
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
}
