import { PopupRoot } from "@/components/PopupRoot"
import type { CommentStorage, CommentTableRow } from "@/entrypoints/background"
import type { CommentSpot } from "@/lib/enhancer"
import type { GitHubIssueAppendSpot } from "@/lib/enhancers/github/GitHubIssueAppendEnhancer"
import type { GitHubIssueCreateSpot } from "@/lib/enhancers/github/GitHubIssueCreateEnhancer"
import type { GitHubPrAppendSpot } from "@/lib/enhancers/github/GitHubPrAppendEnhancer"
import type { GitHubPrCreateSpot } from "@/lib/enhancers/github/GitHubPrCreateEnhancer"

const gh_pr: GitHubPrAppendSpot = {
  domain: "github.com",
  number: 517,
  slug: "diffplug/selfie",
  title: "wowza",
  type: "GH_PR_APPEND",
  unique_key: "github.com:diffplug/selfie:517",
}
const gh_pr_new: GitHubPrCreateSpot = {
  base: "main",
  domain: "github.com",
  head: "cavia-porcellus:selfie:main",
  slug: "diffplug/selfie",
  title: "Update README.md",
  type: "GH_PR_CREATE",
  unique_key: "github.com:diffplug/selfie:main...cavia-porcellus:selfie:main",
}
const gh_issue: GitHubIssueAppendSpot = {
  domain: "github.com",
  number: 523,
  slug: "diffplug/selfie",
  title: "whoa",
  type: "GH_ISSUE_APPEND",
  unique_key: "github.com:diffplug/selfie:523",
}
const gh_issue_new: GitHubIssueCreateSpot = {
  domain: "github.com",
  slug: "diffplug/gitcasso",
  title: "New issue title",
  type: "GH_ISSUE_CREATE",
  unique_key: "github.com:diffplug/gitcasso:new",
}

const spots: CommentSpot[] = [gh_pr, gh_pr_new, gh_issue, gh_issue_new]
const sampleSpots: CommentStorage[] = spots.map((spot) => {
  const state: CommentStorage = {
    drafts: [[0, "Lorem ipsum dolor sit amet, consectetur adipiscing elit."]],
    sentOn: null,
    spot,
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
            content: "lorum ipsum",
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
