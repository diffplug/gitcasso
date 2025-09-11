//import { DraftStats } from '@/lib/enhancers/draftStats'
import { GitPullRequestIcon, IssueOpenedIcon } from '@primer/octicons-react'
import {
  ArrowDown,
  ArrowUp,
  Code,
  ExternalLink,
  Filter,
  Image,
  Link,
  Search,
  TextSelect,
  Trash2,
} from 'lucide-react'
import { useMemo, useState } from 'react'

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

interface BaseDraft {
  id: string
  charCount: number
  codeCount: number
  content: string
  imageCount: number
  type: DraftType
  lastEdit: number
  linkCount: number
  title: string
  url: string
}

interface GitHubDraft extends BaseDraft {
  repoSlug: string
  number: number
}

interface RedditDraft extends BaseDraft {
  subreddit: string
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
    id: '1',
    imageCount: 2,
    lastEdit: Date.now() - 1000 * 60 * 30,
    linkCount: 2,
    number: 1234,
    repoSlug: 'microsoft/vscode',
    title: 'Fix memory leak in extension host',
    type: 'PR',
    url: 'https://github.com/microsoft/vscode/pull/1234',
  } satisfies GitHubDraft,
  {
    charCount: 180,
    codeCount: 0,
    content:
      "I've been using GitLens for years and it's absolutely essential for my workflow. The inline blame annotations are incredibly helpful when...",
    id: '2',
    imageCount: 0,
    lastEdit: Date.now() - 1000 * 60 * 60 * 2,
    linkCount: 1,
    subreddit: 'programming',
    title: "Re: What's your favorite VS Code extension?",
    type: 'REDDIT',
    url: 'https://reddit.com/r/programming/comments/abc123',
  } satisfies RedditDraft,
  {
    charCount: 456,
    codeCount: 1,
    content:
      "When using useEffect with async functions, the cleanup function doesn't seem to be called correctly in certain edge cases...",
    id: '3',
    imageCount: 0,
    lastEdit: Date.now() - 1000 * 60 * 60 * 5,
    linkCount: 0,
    number: 5678,
    repoSlug: 'facebook/react',
    title: 'Unexpected behavior with useEffect cleanup',
    type: 'ISSUE',
    url: 'https://github.com/facebook/react/issues/5678',
  } satisfies GitHubDraft,
  {
    charCount: 322,
    codeCount: 0,
    content:
      'LGTM! Just a few minor suggestions about the examples in the routing section. Consider adding more context about...',
    id: '4',
    imageCount: 4,
    lastEdit: Date.now() - 1000 * 60 * 60 * 24,
    linkCount: 3,
    number: 9012,
    repoSlug: 'vercel/next.js',
    title: 'Update routing documentation',
    type: 'PR',
    url: 'https://github.com/vercel/next.js/pull/9012',
  } satisfies GitHubDraft,
  {
    charCount: 678,
    codeCount: 7,
    content:
      'This PR implements ESM support in worker threads as discussed in the last TSC meeting. The implementation follows...',
    id: '5',
    imageCount: 1,
    lastEdit: Date.now() - 1000 * 60 * 60 * 48,
    linkCount: 5,
    number: 3456,
    repoSlug: 'nodejs/node',
    title: 'Add support for ESM in worker threads',
    type: 'PR',
    url: 'https://github.com/nodejs/node/pull/3456',
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
    if (v >= 1) return `${v}${i.label} ago`
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
  const [sortBy, setSortBy] = useState('edited-newest')
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
      setSelectedIds(new Set(filteredDrafts.map((d) => d.id)))
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
            <col className='w-24' />
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
                          <span className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-700'>
                            <Link className='w-3 h-3' />
                            links
                          </span>
                        </label>
                        <label className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={hasImageFilter}
                            onChange={(e) => setHasImageFilter(e.target.checked)}
                            className='rounded'
                          />
                          <span className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-purple-50 text-purple-700'>
                            <Image className='w-3 h-3' />
                            images
                          </span>
                        </label>
                        <label className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={hasCodeFilter}
                            onChange={(e) => setHasCodeFilter(e.target.checked)}
                            className='rounded'
                          />
                          <span className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-pink-50 text-pink-700'>
                            <Code className='w-3 h-3' />
                            code
                          </span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </th>
              <th
                scope='col'
                className='px-3 py-3 text-left text-xs font-medium text-gray-500 tracking-wider'
              >
                <button
                  type='button'
                  onClick={() =>
                    setSortBy(sortBy === 'edited-newest' ? 'edited-oldest' : 'edited-newest')
                  }
                  className='flex items-center gap-1 hover:text-gray-700'
                >
                  EDITED
                  {sortBy === 'edited-newest' ? (
                    <ArrowDown className='w-3 h-3' />
                  ) : (
                    <ArrowUp className='w-3 h-3' />
                  )}
                </button>
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
  handleOpen: (url: string) => void,
  handleTrash: (draft: { charCount: number; id: string }) => void,
) {
  return (
    <tr key={draft.id} className='hover:bg-gray-50'>
      <td className='px-3 py-3'>
        <input
          type='checkbox'
          checked={selectedIds.has(draft.id)}
          onChange={() => toggleSelection(draft.id)}
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
                    {draft.repoSlug}
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
              {draft.linkCount > 0 && (
                <span className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-700'>
                  <Link className='w-3 h-3' />
                  {draft.linkCount}
                </span>
              )}
              {draft.imageCount > 0 && (
                <span className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-purple-50 text-purple-700'>
                  <Image className='w-3 h-3' />
                  {draft.imageCount}
                </span>
              )}
              {draft.codeCount > 0 && (
                <span className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-pink-50 text-pink-700'>
                  <Code className='w-3 h-3' />
                  {draft.codeCount}
                </span>
              )}
              <span className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-gray-50 text-gray-700'>
                <TextSelect className='w-3 h-3' />
                {draft.charCount}
              </span>
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
            <span className='text-gray-500'>{draft.content.substring(0, 60)}…</span>
          </div>
        </div>
      </td>
      <td className='px-3 py-3 text-sm text-gray-500'>
        <div className='flex flex-col items-center gap-1'>
          <span title={new Date(draft.lastEdit).toLocaleString()} className='whitespace-nowrap'>
            {timeAgo(new Date(draft.lastEdit))}
          </span>
          <div className='flex items-center gap-1'>
            <button
              type='button'
              onClick={() => handleOpen(draft.url)}
              className='p-1.5 hover:bg-gray-100 rounded'
              aria-label='Open in context'
              title='Open in context'
            >
              <ExternalLink className='w-4 h-4 text-gray-600' />
            </button>
            <button
              type='button'
              onClick={() => handleTrash(draft)}
              className='p-1.5 hover:bg-gray-100 rounded'
              aria-label='Discard'
              title='Discard'
            >
              <Trash2 className='w-4 h-4 text-gray-600' />
            </button>
          </div>
        </div>
      </td>
    </tr>
  )
}
