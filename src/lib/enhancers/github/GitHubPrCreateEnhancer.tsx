import OverType, { type OverTypeInstance } from "overtype"
import type {
  CommentEnhancer,
  CommentSpot,
  StrippedLocation,
} from "../../enhancer"
import { logger } from "../../logger"
import { modifyDOM } from "../modifyDOM"
import { commonGitHubOptions, prepareGitHubHighlighter } from "./github-common"

const GH_PR_CREATE = "GH_PR_CREATE" as const

interface GitHubPrCreateSpot extends CommentSpot {
  type: typeof GH_PR_CREATE
  domain: string
  slug: string // owner/repo
  title: string
  head: string // `user:repo:branch` where changes are implemented
  base: string // branch you want changes pulled into
}

export class GitHubPrCreateEnhancer
  implements CommentEnhancer<GitHubPrCreateSpot>
{
  forSpotTypes(): string[] {
    return [GH_PR_CREATE]
  }

  tryToEnhance(
    textarea: HTMLTextAreaElement,
    location: StrippedLocation
  ): GitHubPrCreateSpot | null {
    if (textarea.id === "feedback") {
      return null
    }
    if (location.host !== "github.com") {
      return null
    }

    // /owner/repo/compare/feature/more-enhancers?expand=1
    // or /owner/repo/compare/feat/issue-static-and-dynamic...feature/more-enhancers?expand=1
    logger.debug(
      `${this.constructor.name} examing url`,
      window.location.pathname
    )

    const match = location.pathname.match(
      /^\/([^/]+)\/([^/]+)\/compare\/(?:([^.?]+)\.\.\.)?([^?]+)/
    )
    logger.debug(
      `${this.constructor.name} found match`,
      window.location.pathname,
      match
    )

    if (!match) return null
    const [, owner, repo, baseBranch, compareBranch] = match
    const slug = `${owner}/${repo}`
    const base = baseBranch || "main"
    const head = compareBranch!
    const unique_key = `github.com:${slug}:${base}...${head}`
    const titleInput = document.querySelector(
      'input[placeholder="Title"]'
    ) as HTMLInputElement
    const title = titleInput!.value

    return {
      base,
      domain: location.host,
      head,
      slug,
      title,
      type: GH_PR_CREATE,
      unique_key,
    }
  }

  enhance(
    textArea: HTMLTextAreaElement,
    _spot: GitHubPrCreateSpot
  ): OverTypeInstance {
    prepareGitHubHighlighter()
    const overtypeContainer = modifyDOM(textArea)
    return new OverType(overtypeContainer, {
      ...commonGitHubOptions,
      minHeight: "250px",
      placeholder: "Type your description here...",
    })[0]!
  }

  tableUpperDecoration(spot: GitHubPrCreateSpot): React.ReactNode {
    const { slug } = spot
    return (
      <>
        <span>New PR</span>
        <span className="font-mono text-muted-foreground text-sm">
          {" "}
          {slug}{" "}
        </span>
      </>
    )
  }

  tableTitle(spot: GitHubPrCreateSpot): string {
    return spot.title || "New Pull Request"
  }

  buildUrl(spot: GitHubPrCreateSpot): string {
    return `https://${spot.domain}/${spot.slug}/issue/new`
  }
}
