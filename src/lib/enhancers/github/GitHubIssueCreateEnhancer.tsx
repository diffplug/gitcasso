import { IssueOpenedIcon } from "@primer/octicons-react"
import OverType, { type OverTypeInstance } from "overtype"
import type {
  CommentEnhancer,
  CommentSpot,
  StrippedLocation,
} from "../../enhancer"
import { logger } from "../../logger"
import { modifyDOM } from "../modifyDOM"
import { commonGitHubOptions, prepareGitHubHighlighter } from "./github-common"

const GH_ISSUE_CREATE = "GH_ISSUE_CREATE" as const

interface GitHubIssueCreateSpot extends CommentSpot {
  type: typeof GH_ISSUE_CREATE
  domain: string
  slug: string // owner/repo
  title: string
}

export class GitHubIssueCreateEnhancer
  implements CommentEnhancer<GitHubIssueCreateSpot>
{
  forSpotTypes(): string[] {
    return [GH_ISSUE_CREATE]
  }

  tryToEnhance(
    textarea: HTMLTextAreaElement,
    location: StrippedLocation
  ): GitHubIssueCreateSpot | null {
    if (textarea.id === "feedback") {
      return null
    }
    if (location.host !== "github.com") {
      return null
    }

    // Parse GitHub URL structure: /owner/repo/issues/123 or /owner/repo/pull/456
    logger.debug(`${this.constructor.name} examing url`, location.pathname)

    const match = location.pathname.match(
      /^\/([^/]+)\/([^/]+)(?:\/issues\/new)/
    )
    logger.debug(`${this.constructor.name} found match`, location.pathname)

    if (!match) return null
    const [, owner, repo] = match
    const slug = `${owner}/${repo}`
    const unique_key = `github.com:${slug}:new`
    const titleInput = document.querySelector(
      'input[placeholder="Title"]'
    ) as HTMLInputElement
    const title = titleInput?.value || ""
    return {
      domain: location.host,
      slug,
      title,
      type: GH_ISSUE_CREATE,
      unique_key,
    }
  }

  enhance(
    textArea: HTMLTextAreaElement,
    _spot: GitHubIssueCreateSpot
  ): OverTypeInstance {
    prepareGitHubHighlighter()
    const overtypeContainer = modifyDOM(textArea)
    return new OverType(overtypeContainer, {
      ...commonGitHubOptions,
      minHeight: "400px",
      placeholder: "Type your description here...",
    })[0]!
  }

  tableUpperDecoration(spot: GitHubIssueCreateSpot): React.ReactNode {
    return (
      <>
        <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center">
          <IssueOpenedIcon size={16} />
        </span>
        <span>
          New |{" "}
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

  tableTitle(spot: GitHubIssueCreateSpot): string {
    return spot.title || "New Issue"
  }

  buildUrl(spot: GitHubIssueCreateSpot): string {
    return `https://${spot.domain}/${spot.slug}/issue/new`
  }
}
