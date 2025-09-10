import type { CommentState } from '@/entrypoints/background'
import type { CommentSpot } from '@/lib/enhancer'
import type { GitHubIssueAddCommentSpot } from '@/lib/enhancers/github/githubIssueAddComment'
import type { GitHubPRAddCommentSpot } from '@/lib/enhancers/github/githubPRAddComment'

const gh_pr: GitHubPRAddCommentSpot = {
  domain: 'github.com',
  number: 517,
  slug: 'diffplug/selfie',
  type: 'GH_PR_ADD_COMMENT',
  unique_key: 'github.com:diffplug/selfie:517',
}
const gh_issue: GitHubIssueAddCommentSpot = {
  domain: 'github.com',
  number: 523,
  slug: 'diffplug/selfie',
  type: 'GH_ISSUE_ADD_COMMENT',
  unique_key: 'github.com:diffplug/selfie:523',
}

const spots: CommentSpot[] = [gh_pr, gh_issue]

export const sampleSpots: CommentState[] = spots.map((spot) => {
  const state: CommentState = {
    drafts: [
      [
        0,
        {
          body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        },
      ],
    ],
    spot,
    tab: {
      tabId: 123,
      windowId: 456,
    },
  }
  return state
})
