import { OverType } from '../../overtype/mock-overtype'
import type { CommentEnhancer, CommentSpot } from '../enhancer'

const GITHUB_SPOT_TYPES = [
  'GH_PR_ADD_COMMENT',
  /* TODO
  'GH_ISSUE_NEW',
  'GH_PR_NEW',
  'GH_ISSUE_ADD_COMMENT',
  'GH_ISSUE_EDIT_COMMENT',
  'GH_PR_EDIT_COMMENT',
  'GH_PR_CODE_COMMENT',
  */
] as const

export type GitHubSpotType = (typeof GITHUB_SPOT_TYPES)[number]

export interface GitHubAddCommentSpot extends CommentSpot {
  type: GitHubSpotType // Override to narrow from string to specific union
  domain: string
  slug: string // owner/repo
  number: number // issue/PR number, undefined for new issues and PRs
}

export class GitHubAddCommentEnhancer implements CommentEnhancer<GitHubAddCommentSpot> {
  forSpotTypes(): string[] {
    return [...GITHUB_SPOT_TYPES]
  }

  tryToEnhance(textarea: HTMLTextAreaElement): [OverType, GitHubAddCommentSpot] | null {
    // Only handle github.com domains TODO: identify GitHub Enterprise somehow
    if (window.location.hostname !== 'github.com') {
      return null
    }

    // Parse GitHub URL structure: /owner/repo/issues/123 or /owner/repo/pull/456
    const match = window.location.pathname.match(/^\/([^/]+)\/([^/]+)(?:\/pull\/(\d+))/)
    if (!match) return null
    const [, owner, repo, numberStr] = match
    const slug = `${owner}/${repo}`
    const number = parseInt(numberStr!, 10)

    const unique_key = `github.com:${slug}:${number}`

    const spot: GitHubAddCommentSpot = {
      domain: 'github.com',
      number,
      slug,
      type: 'GH_PR_ADD_COMMENT',
      unique_key,
    }
    const overtype = new OverType(textarea)
    return [overtype, spot]
  }

  tableTitle(spot: GitHubAddCommentSpot): string {
    const { slug, number } = spot
    return `${slug} PR #${number}`
  }

  tableIcon(_: GitHubAddCommentSpot): string {
    return '🔄' // PR icon TODO: icon urls in /public
  }

  buildUrl(spot: GitHubAddCommentSpot): string {
    return `https://${spot.domain}/${spot.slug}/pull/${spot.number}`
  }
}
