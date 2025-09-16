import { PopupRoot } from '@/components/PopupRoot'
import type { CommentStorage, CommentTableRow } from '@/entrypoints/background'
import type { CommentSpot } from '@/lib/enhancer'
import type { GitHubIssueAddCommentSpot } from '@/lib/enhancers/github/githubIssueAddComment'
import type { GitHubPRAddCommentSpot } from '@/lib/enhancers/github/githubPRAddComment'

const gh_pr: GitHubPRAddCommentSpot = {
  domain: 'github.com',
  number: 517,
  slug: 'diffplug/selfie',
  title: 'wowza',
  type: 'GH_PR_ADD_COMMENT',
  unique_key: 'github.com:diffplug/selfie:517',
}
const gh_issue: GitHubIssueAddCommentSpot = {
  domain: 'github.com',
  number: 523,
  slug: 'diffplug/selfie',
  title: 'whoa',
  type: 'GH_ISSUE_ADD_COMMENT',
  unique_key: 'github.com:diffplug/selfie:523',
}

const spots: CommentSpot[] = [gh_pr, gh_issue]
const sampleSpots: CommentStorage[] = spots.map((spot) => {
  const state: CommentStorage = {
    drafts: [[0, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.']],
    sentOn: null,
    spot,
    tab: {
      tabId: 123,
      windowId: 456,
    },
    trashedOn: null,
  }
  return state
})

export function Replica() {
  return (
    <PopupRoot
      drafts={sampleSpots.map((storage) => {
        const row: CommentTableRow = {
          isOpenTab: true,
          isSent: true,
          isTrashed: false,
          latestDraft: {
            content: 'lorum ipsum',
            stats: {
              charCount: 99,
              codeBlocks: [],
              images: [],
              links: [],
            },
            time: 0,
          },
          spot: storage.spot,
        }
        return row
      })}
    ></PopupRoot>
  )
}
