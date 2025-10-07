import hljs from "highlight.js"
import type { Options } from "overtype"
import OverType from "overtype"
import { oncePerRefresh } from "@/lib/once-per-refresh"

export const commonGitHubOptions: Options = {
  autoResize: true,
  lineHeight: "var(--text-body-lineHeight-medium, 1.4285)",
  padding: "var(--base-size-16)",
}

export function prepareGitHubHighlighter() {
  oncePerRefresh("github-highlighter", () => {
    const textColor = "rgb(31, 35, 40)"
    const headingColor = "rgb(174, 52, 151)"
    OverType.setTheme({
      colors: {
        blockquote: "rgb(89, 99, 110)",
        code: "#59636e",
        codeBg: "#f6f8fa",
        cursor: "#000000",
        em: "rgb(126, 123, 255)",
        h1: headingColor,
        h2: headingColor,
        h3: headingColor,
        hr: "#5a7a9b",
        link: "rgb(9, 105, 218)",
        selection: "rgba(0, 123, 255, 0.3)",
        strong: "rgb(45, 1, 142)",
        syntaxMarker: textColor,
        text: textColor,
      },
      name: "custom-github",
    })
    OverType.setCodeHighlighter(githubHighlighter)
  })
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }
  return text.replace(/[&<>"']/g, (m) => map[m]!)
}

function githubHighlighter(code: string, language?: string) {
  try {
    if (language && hljs.getLanguage(language)) {
      const result = hljs.highlight(code, { language })
      return result.value
    } else {
      // No language specified - escape HTML to prevent tags from being interpreted
      return escapeHtml(code)
    }
  } catch (error) {
    console.warn("highlight.js highlighting failed:", error)
    return escapeHtml(code)
  }
}

// Project-related helper functions

/**
 * Check if the pathname matches a GitHub project URL pattern.
 * Matches: /orgs/{org}/projects/{id} or /users/{user}/projects/{id}
 * Optional: /views/{viewId} suffix
 */
export function isProjectUrl(pathname: string): boolean {
  return /^\/(?:orgs|users)\/[^/]+\/projects\/\d+(?:\/views\/\d+)?/.test(
    pathname
  )
}

/**
 * Parse the issue parameter from project URLs.
 * Format: ?issue=owner|repo|number
 * Returns: { slug: "owner/repo", number: 123 } or null if invalid
 */
export function parseProjectIssueParam(
  searchParams: URLSearchParams
): { slug: string; number: number } | null {
  const issueParam = searchParams.get("issue")
  if (!issueParam) return null

  const parts = issueParam.split("|")
  if (parts.length !== 3) return null

  const [owner, repo, numberStr] = parts
  const number = parseInt(numberStr!, 10)

  if (Number.isNaN(number)) return null

  return {
    slug: `${owner}/${repo}`,
    number,
  }
}

/**
 * Check if an element is within a project CommentBox container.
 * CommentBox containers are used for adding new comments (not editing).
 */
export function isInProjectCommentBox(element: HTMLElement): boolean {
  return !!element.closest('[class*="Shared-module__CommentBox"]')
}
