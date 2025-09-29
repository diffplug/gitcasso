import { IssueOpenedIcon } from "@primer/octicons-react"
import OverType, { type OverTypeInstance } from "overtype"
import type React from "react"
import type {
  CommentEnhancer,
  CommentSpot,
  StrippedLocation,
} from "@/lib/enhancer"
import { logger } from "@/lib/logger"
import { modifyDOM } from "../modifyDOM"
import { commonGitHubOptions, prepareGitHubHighlighter } from "./github-common"

const GH_ISSUE_APPEND = "GH_ISSUE_APPEND" as const

export interface GitHubIssueAppendSpot extends CommentSpot {
  type: typeof GH_ISSUE_APPEND
  title: string
  domain: string
  slug: string // owner/repo
  number: number // issue number, undefined for new issues
}

export class GitHubIssueAppendEnhancer
  implements CommentEnhancer<GitHubIssueAppendSpot>
{
  forSpotTypes(): string[] {
    return [GH_ISSUE_APPEND]
  }

  tryToEnhance(
    textarea: HTMLTextAreaElement,
    location: StrippedLocation
  ): GitHubIssueAppendSpot | null {
    if (textarea.id === "feedback") {
      return null
    }
    if (location.host !== "github.com") {
      return null
    }

    // Don't enhance textareas that are within the issue/PR body editing container
    const bodyContainer = textarea.closest(".react-issue-body")
    if (bodyContainer) {
      return null
    }

    // Parse GitHub URL structure: /owner/repo/issues/123 or /owner/repo/pull/456
    logger.debug(`${this.constructor.name} examing url`, location.pathname)

    const match = location.pathname.match(
      /^\/([^/]+)\/([^/]+)(?:\/issues\/(\d+))/
    )
    logger.debug(`${this.constructor.name} found match`, location.pathname)
    if (!match) return null

    const [, owner, repo, numberStr] = match
    const slug = `${owner}/${repo}`
    const number = parseInt(numberStr!, 10)
    const unique_key = `github.com:${slug}:${number}`
    const title = document
      .querySelector("main h1")!
      .textContent.replace(/\s*#\d+$/, "")
      .trim()
    return {
      domain: location.host,
      number,
      slug,
      title,
      type: GH_ISSUE_APPEND,
      unique_key,
    }
  }

  enhance(
    textArea: HTMLTextAreaElement,
    _spot: GitHubIssueAppendSpot
  ): OverTypeInstance {
    prepareGitHubHighlighter()
    const overtypeContainer = modifyDOM(textArea)
    return new OverType(overtypeContainer, {
      ...commonGitHubOptions,
      minHeight: "100px",
      placeholder: "Use Markdown to format your comment",
    })[0]!
  }

  tableUpperDecoration(spot: GitHubIssueAppendSpot): React.ReactNode {
    return (
      <>
        <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center">
          <IssueOpenedIcon size={16} />
        </span>
        <span>
          #{spot.number} |{" "}
          <a
            href={`https://${spot.domain}/${spot.slug}`}
            className="truncate hover:underline"
          >
            {spot.slug}
          </a>
        </span>
      </>
    )
  }

  tableTitle(spot: GitHubIssueAppendSpot): string {
    return spot.title
  }
}
