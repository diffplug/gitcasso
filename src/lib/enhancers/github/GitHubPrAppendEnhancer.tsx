import { GitPullRequestIcon } from "@primer/octicons-react"
import OverType, { type OverTypeInstance } from "overtype"
import type React from "react"
import { LinkOutOfPopup } from "@/components/LinkOutOfPopup"
import type {
  CommentEnhancer,
  CommentSpot,
  StrippedLocation,
} from "@/lib/enhancer"
import { logger } from "@/lib/logger"
import { fixupOvertype, modifyDOM } from "../modifyDOM"
import { commonGitHubOptions, prepareGitHubHighlighter } from "./github-common"

const GH_PR_APPEND = "GH_PR_APPEND" as const

export interface GitHubPrAppendSpot extends CommentSpot {
  type: typeof GH_PR_APPEND
  title: string
  domain: string
  slug: string // owner/repo
  number: number // issue/PR number, undefined for new issues and PRs
}

export class GitHubPrAppendEnhancer
  implements CommentEnhancer<GitHubPrAppendSpot>
{
  forSpotTypes(): string[] {
    return [GH_PR_APPEND]
  }

  tryToEnhance(
    textarea: HTMLTextAreaElement,
    location: StrippedLocation
  ): GitHubPrAppendSpot | null {
    // Only handle github.com domains TODO: identify GitHub Enterprise somehow
    if (location.host !== "github.com" || textarea.id !== "new_comment_field") {
      return null
    }

    // Parse GitHub URL structure: /owner/repo/issues/123 or /owner/repo/pull/456
    logger.debug(`${this.constructor.name} examing url`, location.pathname)

    const match = location.pathname.match(
      /^\/([^/]+)\/([^/]+)(?:\/pull\/(\d+))/
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
      type: GH_PR_APPEND,
      unique_key,
    }
  }

  enhance(
    textArea: HTMLTextAreaElement,
    _spot: GitHubPrAppendSpot
  ): OverTypeInstance {
    prepareGitHubHighlighter()
    const overtypeContainer = modifyDOM(textArea)
    const overtype = fixupOvertype(
      new OverType(overtypeContainer, {
        ...commonGitHubOptions,
        minHeight: "102px",
        padding: "var(--base-size-8)",
        placeholder: "Add your comment here...",
      })
    )
    return overtype
  }

  tableUpperDecoration(spot: GitHubPrAppendSpot): React.ReactNode {
    return (
      <>
        <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center">
          <GitPullRequestIcon size={16} />
        </span>
        <span>
          #{spot.number}{" "}
          <LinkOutOfPopup href={`https://${spot.domain}/${spot.slug}`}>
            {spot.slug}
          </LinkOutOfPopup>
        </span>
      </>
    )
  }

  tableTitle(spot: GitHubPrAppendSpot): string {
    return spot.title
  }
}
