import { OverType } from '../../overtype/mock-overtype'
import type { CommentEnhancer, CommentSpot } from '../enhancer'

const GITHUB_COMMENT_TYPES = [
  'GH_ISSUE_NEW',
  'GH_PR_NEW',
  'GH_ISSUE_ADD_COMMENT',
  'GH_PR_ADD_COMMENT',
  /* TODO
  'GH_ISSUE_EDIT_COMMENT',
  'GH_PR_EDIT_COMMENT',
  'GH_PR_CODE_COMMENT',
  */
] as const

export type GitHubCommentType = (typeof GITHUB_COMMENT_TYPES)[number]

export interface GitHubContext extends CommentSpot {
  type: GitHubCommentType // Override to narrow from string to specific union
  domain: string
  slug: string // owner/repo
  number?: number | undefined // issue/PR number, undefined for new issues and PRs
}

export class GitHubHandler implements CommentEnhancer<GitHubContext> {
  forCommentTypes(): string[] {
    return [...GITHUB_COMMENT_TYPES]
  }

  tryToEnhance(textarea: HTMLTextAreaElement): [OverType, GitHubContext] | null {
    // Only handle GitHub domains
    if (!window.location.hostname.includes('github')) {
      return null
    }

    const pathname = window.location.pathname

    // Parse GitHub URL structure: /owner/repo/issues/123 or /owner/repo/pull/456
    const match = pathname.match(/^\/([^/]+)\/([^/]+)(?:\/(issues|pull)\/(\d+))?/)
    if (!match) return null

    const [, owner, repo, urlType, numberStr] = match
    const slug = `${owner}/${repo}`
    const number = numberStr ? parseInt(numberStr, 10) : undefined

    // Determine comment type
    let type: GitHubCommentType

    // New issue
    if (pathname.includes('/issues/new')) {
      type = 'GH_ISSUE_NEW'
    }
    // New PR
    else if (pathname.includes('/compare/') || pathname.endsWith('/compare')) {
      type = 'GH_PR_NEW'
    }
    // Existing issue or PR page
    else if (urlType && number) {
      if (urlType === 'issues') {
        type = 'GH_ISSUE_ADD_COMMENT'
      } else {
        type = 'GH_PR_ADD_COMMENT'
      }
    } else {
      return null
    }

    // Generate unique key based on context
    let unique_key = `github:${slug}`
    if (number) {
      unique_key += `:${urlType}:${number}`
    } else {
      unique_key += ':new'
    }

    const context: GitHubContext = {
      domain: window.location.hostname,
      number,
      slug,
      type,
      unique_key,
    }

    // Create OverType instance for this textarea
    const overtype = new OverType(textarea)

    return [overtype, context]
  }

  generateDisplayTitle(context: GitHubContext): string {
    const { slug, number } = context
    if (number) {
      return `Comment on ${slug} #${number}`
    }
    return `New ${window.location.pathname.includes('/issues/') ? 'issue' : 'PR'} in ${slug}`
  }

  generateIcon(context: GitHubContext): string {
    switch (context.type) {
      case 'GH_ISSUE_NEW':
      case 'GH_ISSUE_ADD_COMMENT':
        return '🐛' // Issue icon
      case 'GH_PR_NEW':
      case 'GH_PR_ADD_COMMENT':
        return '🔄' // PR icon
    }
  }

  buildUrl(context: GitHubContext): string {
    const baseUrl = `https://${context.domain}/${context.slug}`

    if (context.number) {
      const type = window.location.pathname.includes('/issues/') ? 'issues' : 'pull'
      return `${baseUrl}/${type}/${context.number}`
    }

    return baseUrl
  }
}
