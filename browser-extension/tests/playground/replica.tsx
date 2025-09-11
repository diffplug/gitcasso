import { SpotTable } from '@/components/SpotTable'
import type { CommentState } from '@/entrypoints/background'
import type { CommentSpot } from '@/lib/enhancer'
import type { GitHubIssueAddCommentSpot } from '@/lib/enhancers/github/githubIssueAddComment'
import type { GitHubPRAddCommentSpot } from '@/lib/enhancers/github/githubPRAddComment'
import { EnhancerRegistry } from '@/lib/registries'

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
const sampleSpots: CommentState[] = spots.map((spot) => {
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

export function Replica() {
  const handleSpotClick = (spot: CommentState) => {
    alert(`Clicked: ${spot.spot.type}\nTab: ${spot.tab.tabId}`)
  }

  const enhancers = new EnhancerRegistry()

  return (
    <div className='w-full'>
      <h2 className='mb-4 text-lg font-semibold text-foreground'>Open Comment Spots</h2>

      <div className='border rounded-md'>
        <SpotTable
          spots={sampleSpots}
          enhancerRegistry={enhancers}
          onSpotClick={handleSpotClick}
          headerClassName='p-3 font-medium text-muted-foreground'
          rowClassName='transition-colors hover:bg-muted/50 border-b border-border/40'
          cellClassName='p-3'
          emptyStateMessage='No open comment spots'
          showHeader={true}
        />
      </div>
    </div>
  )
}
