//import { DraftStats } from '@/lib/enhancers/draftStats'

import { GitPullRequestIcon, IssueOpenedIcon } from '@primer/octicons-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Clock, Code, Filter, Image, Link, Search, TextSelect } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { CommentSpot } from '@/lib/enhancer'
import type { DraftStats } from '@/lib/enhancers/draftStats'

// CVA configuration for stat badges
const statBadge = cva('inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs', {
  defaultVariants: {
    type: 'text',
  },
  variants: {
    type: {
      code: 'bg-pink-50 text-pink-700',
      image: 'bg-purple-50 text-purple-700',
      link: 'bg-blue-50 text-blue-700',
      text: 'bg-gray-50 text-gray-700',
      time: 'bg-gray-50 text-gray-700',
    },
  },
})

// Map types to their icons
const typeIcons = {
  code: Code,
  image: Image,
  link: Link,
  text: TextSelect,
  time: Clock,
} as const

// StatBadge component
type BadgeProps = VariantProps<typeof statBadge> & {
  text: number | string
  type: keyof typeof typeIcons
}

const Badge = ({ text, type }: BadgeProps) => {
  const Icon = typeIcons[type]
  return (
    <span className={statBadge({ type })}>
      <Icon className='w-3 h-3' />
      {text}
    </span>
  )
}

/*
interface GitHubIssueAddCommentSpot extends CommentSpot {
  type: 'GH_ISSUE_ADD_COMMENT'
  domain: 'string'
  slug: string // owner/repo
  number: number // issue number, undefined for new issues
  title: string
}
export interface GitHubPRAddCommentSpot extends CommentSpot {
  type: 'GH_PR_ADD_COMMENT' // Override to narrow from string to specific union
  domain: string
  slug: string // owner/repo
  number: number // issue/PR number, undefined for new issues and PRs
  title: string
}
*/

type DraftType = 'PR' | 'ISSUE' | 'REDDIT'
type DraftState = 'EDITING' | 'ABANDONED' | 'SENT'
type TabState = 'OPEN_NOW' | 'CLOSED'

interface BaseDraft extends CommentSpot {
  charCount: number
  codeCount: number
  content: string
  imageCount: number
  type: DraftType
  lastEdit: number
  linkCount: number
}

interface GitHubDraft extends BaseDraft {
  title: string
  slug: string
  number: number
}

interface RedditDraft extends BaseDraft {
  title: string
  subreddit: string
}

interface LatestDraft {
  spot: BaseDraft
  draft: string
  time: number
  draftStats: DraftStats
}

type Draft = GitHubDraft | RedditDraft

const isGitHubDraft = (draft: Draft): draft is GitHubDraft => {
  return draft.type === 'PR' || draft.type === 'ISSUE'
}

const isRedditDraft = (draft: Draft): draft is RedditDraft => {
  return draft.type === 'REDDIT'
}

const generateMockDrafts = (): Draft[] => [
  {
    charCount: 245,
    codeCount: 3,
    content:
      'This PR addresses the memory leak issue reported in #1233. The problem was caused by event listeners not being properly disposed...',
    imageCount: 2,
    lastEdit: Date.now() - 1000 * 60 * 30,
    linkCount: 2,
    number: 1234,
    slug: 'microsoft/vscode',
    title: 'Fix memory leak in extension host',
    type: 'PR',
    unique_key: '1',
  } satisfies GitHubDraft,
  {
    charCount: 180,
    codeCount: 0,
    content:
      "I've been using GitLens for years and it's absolutely essential for my workflow. The inline blame annotations are incredibly helpful when...",
    imageCount: 0,
    lastEdit: Date.now() - 1000 * 60 * 60 * 2,
    linkCount: 1,
    subreddit: 'programming',
    title: "Re: What's your favorite VS Code extension?",
    type: 'REDDIT',
    unique_key: '2',
  } satisfies RedditDraft,
  {
    charCount: 456,
    codeCount: 1,
    content:
      "When using useEffect with async functions, the cleanup function doesn't seem to be called correctly in certain edge cases...",
    imageCount: 0,
    lastEdit: Date.now() - 1000 * 60 * 60 * 5,
    linkCount: 0,
    number: 5678,
    slug: 'facebook/react',
    title: 'Unexpected behavior with useEffect cleanup',
    type: 'ISSUE',
    unique_key: '3',
  } satisfies GitHubDraft,
  {
    charCount: 322,
    codeCount: 0,
    content:
      'LGTM! Just a few minor suggestions about the examples in the routing section. Consider adding more context about...',
    imageCount: 4,
    lastEdit: Date.now() - 1000 * 60 * 60 * 24,
    linkCount: 3,
    number: 9012,
    slug: 'vercel/next.js',
    title: 'Update routing documentation',
    type: 'PR',
    unique_key: '4',
  } satisfies GitHubDraft,
  {
    charCount: 678,
    codeCount: 7,
    content:
      'This PR implements ESM support in worker threads as discussed in the last TSC meeting. The implementation follows...',
    imageCount: 1,
    lastEdit: Date.now() - 1000 * 60 * 60 * 48,
    linkCount: 5,
    number: 3456,
    slug: 'nodejs/node',
    title: 'Add support for ESM in worker threads',
    type: 'PR',
    unique_key: '5',
  } satisfies GitHubDraft,
]

// Helper function for relative time
const timeAgo = (date: Date | number) => {
  const timestamp = typeof date === 'number' ? date : date.getTime()
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  const intervals = [
    { label: 'y', secs: 31536000 },
    { label: 'mo', secs: 2592000 },
    { label: 'w', secs: 604800 },
    { label: 'd', secs: 86400 },
    { label: 'h', secs: 3600 },
    { label: 'm', secs: 60 },
    { label: 's', secs: 1 },
  ]
  for (const i of intervals) {
    const v = Math.floor(seconds / i.secs)
    if (v >= 1) return `${v}${i.label}`
  }
  return 'just now'
}

export const ClaudePrototype = () => {
  const [drafts] = useState(generateMockDrafts())
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [hasCodeFilter, setHasCodeFilter] = useState(false)
  const [hasImageFilter, setHasImageFilter] = useState(false)
  const [hasLinkFilter, setHasLinkFilter] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, _setSortBy] = useState('edited-newest')
  const [showFilters, setShowFilters] = useState(false)

  const filteredDrafts = useMemo(() => {
    let filtered = [...drafts]
    if (hasCodeFilter) {
      filtered = filtered.filter((d) => d.codeCount > 0)
    }
    if (hasImageFilter) {
      filtered = filtered.filter((d) => d.imageCount > 0)
    }
    if (hasLinkFilter) {
      filtered = filtered.filter((d) => d.linkCount > 0)
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((d) =>
        Object.values(d).some((value) => String(value).toLowerCase().includes(query)),
      )
    }
    // Sort
    switch (sortBy) {
      case 'edited-newest':
        filtered.sort((a, b) => b.lastEdit - a.lastEdit)
        break
      case 'edited-oldest':
        filtered.sort((a, b) => a.lastEdit - b.lastEdit)
        break
    }
    return filtered
  }, [drafts, hasCodeFilter, hasImageFilter, hasLinkFilter, searchQuery, sortBy])

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredDrafts.length && filteredDrafts.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredDrafts.map((d) => d.unique_key)))
    }
  }

  const handleOpen = (url: string) => {
    window.open(url, '_blank')
  }

  const handleTrash = (draft: { charCount: number; id: string }) => {
    if (draft.charCount > 20) {
      if (confirm('Are you sure you want to discard this draft?')) {
        console.log('Trashing draft:', draft.id)
      }
    } else {
      console.log('Trashing draft:', draft.id)
    }
  }

  // Empty states
  if (drafts.length === 0) {
    return (
      <div className='min-h-screen bg-white p-8'>
        <div className='max-w-4xl mx-auto text-center py-16'>
          <h2 className='text-2xl font-semibold mb-4'>No comments open</h2>
          <p className='text-gray-600 mb-6'>
            Your drafts will appear here when you start typing in comment boxes across GitHub and
            Reddit.
          </p>
          <div className='space-y-2'>
            <button type='button' className='text-blue-600 hover:underline'>
              How it works
            </button>
            <span className='mx-2'>·</span>
            <button type='button' className='text-blue-600 hover:underline'>
              Check permissions
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (
    filteredDrafts.length === 0 &&
    (searchQuery || hasCodeFilter || hasImageFilter || hasLinkFilter)
  ) {
    return (
      <div className='min-h-screen bg-white'>
        <div className='p-6 border-b'>
          {/* Keep the header controls visible */}
          <div className='flex flex-wrap gap-3 items-center'>
            {/* Search */}
            <div className='relative flex-1 max-w-xs'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
              <input
                type='text'
                placeholder='Search drafts...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md text-sm'
              />
            </div>
          </div>
        </div>

        <div className='text-center py-16'>
          <p className='text-gray-600 mb-4'>No matches found</p>
          <button
            type='button'
            onClick={() => {
              setHasCodeFilter(false)
              setHasImageFilter(false)
              setHasLinkFilter(false)
              setSearchQuery('')
            }}
            className='text-blue-600 hover:underline'
          >
            Clear filters
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-white'>
      {/* Header controls */}
      <div className='p-3 border-b'>
        <div className='flex flex-wrap gap-3 items-center'></div>

        {/* Bulk actions bar - floating popup */}
        {selectedIds.size > 0 && (
          <div className='fixed bottom-6 left-1/2 transform -translate-x-1/2 p-3 bg-blue-50 rounded-md shadow-lg border border-blue-200 flex items-center gap-3 z-50'>
            <span className='text-sm font-medium'>{selectedIds.size} selected</span>
            <button type='button' className='text-sm text-blue-600 hover:underline'>
              Copy
            </button>
            <button type='button' className='text-sm text-blue-600 hover:underline'>
              Preview
            </button>
            <button type='button' className='text-sm text-blue-600 hover:underline'>
              Discard
            </button>
            <button type='button' className='text-sm text-blue-600 hover:underline'>
              Open
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='w-full table-fixed'>
          <colgroup>
            <col className='w-10' />
            <col />
          </colgroup>
          <thead className='border-b'>
            <tr>
              <th scope='col' className='px-3 py-3'>
                <input
                  type='checkbox'
                  checked={selectedIds.size === filteredDrafts.length && filteredDrafts.length > 0}
                  onChange={toggleSelectAll}
                  aria-label='Select all'
                  className='rounded'
                />
              </th>
              <th
                scope='col'
                className='px-3 py-3 text-left text-xs font-medium text-gray-500 tracking-wider'
              >
                <div className='relative'>
                  <div className='flex items-center gap-1'>
                    <div className='relative flex-1'>
                      <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                      <input
                        type='text'
                        placeholder='Search drafts...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    </div>
                    <button
                      type='button'
                      onClick={() => setShowFilters(!showFilters)}
                      className={`p-1.5 hover:bg-gray-100 rounded ${showFilters ? 'bg-gray-100' : ''}`}
                      title='Filter options'
                    >
                      <Filter className='w-4 h-4 text-gray-600' />
                    </button>
                  </div>
                  {showFilters && (
                    <div className='absolute top-full right-0 mt-1 p-3 bg-white border border-gray-300 rounded-md shadow-lg z-10 min-w-48'>
                      <div className='space-y-2'>
                        <label className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={hasLinkFilter}
                            onChange={(e) => setHasLinkFilter(e.target.checked)}
                            className='rounded'
                          />
                          <Badge type='link' text='links' />
                        </label>
                        <label className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={hasImageFilter}
                            onChange={(e) => setHasImageFilter(e.target.checked)}
                            className='rounded'
                          />
                          <Badge type='image' text='images' />
                        </label>
                        <label className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={hasCodeFilter}
                            onChange={(e) => setHasCodeFilter(e.target.checked)}
                            className='rounded'
                          />
                          <Badge type='code' text='code' />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {filteredDrafts.map((draft) =>
              commentRow(draft, selectedIds, toggleSelection, handleOpen, handleTrash),
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
function commentRow(
  draft: Draft,
  selectedIds: Set<unknown>,
  toggleSelection: (id: string) => void,
  _handleOpen: (url: string) => void,
  _handleTrash: (draft: { charCount: number; id: string }) => void,
) {
  return (
    <tr key={draft.unique_key} className='hover:bg-gray-50'>
      <td className='px-3 py-3'>
        <input
          type='checkbox'
          checked={selectedIds.has(draft.unique_key)}
          onChange={() => toggleSelection(draft.unique_key)}
          className='rounded'
        />
      </td>
      <td className='px-3 py-3'>
        <div className='space-y-1'>
          {/* Context line */}
          <div className='flex items-center justify-between gap-1.5 text-xs text-gray-600'>
            <div className='flex items-center gap-1.5 min-w-0 flex-1'>
              <span className='w-4 h-4 flex items-center justify-center flex-shrink-0'>
                {draft.type === 'PR' && <GitPullRequestIcon size={16} />}
                {draft.type === 'ISSUE' && <IssueOpenedIcon size={16} />}
                {draft.type === 'REDDIT' && (
                  <img
                    src='https://styles.redditmedia.com/t5_2fwo/styles/communityIcon_1bqa1ibfp8q11.png?width=128&frame=1&auto=webp&s=400b33e7080aa4996c405a96b3872a12f0e3b68d'
                    alt='Reddit'
                    className='w-4 h-4 rounded-full'
                  />
                )}
              </span>

              {isGitHubDraft(draft) && (
                <>
                  #{draft.number}
                  <a href='TODO' className='hover:underline truncate'>
                    {draft.slug}
                  </a>
                </>
              )}
              {isRedditDraft(draft) && (
                <a href={'TODO'} className='hover:underline truncate'>
                  r/{draft.subreddit}
                </a>
              )}
            </div>
            <div className='flex items-center gap-1 flex-shrink-0'>
              {draft.linkCount > 0 && <Badge type='link' text={draft.linkCount} />}
              {draft.imageCount > 0 && <Badge type='image' text={draft.imageCount} />}
              {draft.codeCount > 0 && <Badge type='code' text={draft.codeCount} />}
              <Badge type='text' text={draft.charCount} />
              <Badge type='time' text={timeAgo(draft.lastEdit)} />
            </div>
          </div>

          {/* Title */}
          <div className='text-sm truncate hover:underline'>
            <a href='TODO' className='font-medium'>
              {draft.title}
            </a>
          </div>
          {/* Draft */}
          <div className='text-sm truncate'>
            <span className='text-gray-500'>{draft.content.substring(0, 100)}…</span>
          </div>
        </div>
      </td>
    </tr>
  )
}
