import {
  ArrowDown,
  ArrowUp,
  AtSign,
  CheckCircle2,
  Circle,
  Code,
  ExternalLink,
  GitCommit,
  GitPullRequest,
  Globe,
  Link,
  Lock,
  MessageSquare,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react'
import { useMemo, useState } from 'react'

// Mock data generator
const generateMockDrafts = () => [
  {
    account: '@johnsmith',
    charCount: 245,
    content:
      'This PR addresses the memory leak issue reported in #1233. The problem was caused by event listeners not being properly disposed...',
    hasCode: true,
    hasMention: true,
    id: '1',
    kind: 'PR',
    lastEdit: Date.now() - 1000 * 60 * 30,
    linkCount: 2,
    number: 1234,
    platform: 'GitHub',
    private: true,
    repoSlug: 'microsoft/vscode',
    state: { type: 'open' },
    title: 'Fix memory leak in extension host',
    url: 'https://github.com/microsoft/vscode/pull/1234',
  },
  {
    account: 'u/techwriter',
    charCount: 180,
    content:
      "I've been using GitLens for years and it's absolutely essential for my workflow. The inline blame annotations are incredibly helpful when...",
    hasCode: false,
    hasMention: false,
    id: '2',
    kind: 'Comment',
    lastEdit: Date.now() - 1000 * 60 * 60 * 2,
    linkCount: 1,
    private: false,
    repoSlug: 'r/programming',
    state: { type: 'post' },
    title: "Re: What's your favorite VS Code extension?",
    url: 'https://reddit.com/r/programming/comments/abc123',
  },
  {
    account: '@sarahdev',
    charCount: 456,
    content:
      "When using useEffect with async functions, the cleanup function doesn't seem to be called correctly in certain edge cases...",
    hasCode: true,
    hasMention: false,
    id: '3',
    kind: 'Issue',
    lastEdit: Date.now() - 1000 * 60 * 60 * 5,
    linkCount: 0,
    number: 5678,
    platform: 'GitHub',
    private: false,
    repoSlug: 'facebook/react',
    state: { type: 'open' },
    title: 'Unexpected behavior with useEffect cleanup',
    url: 'https://github.com/facebook/react/issues/5678',
  },
  {
    account: '@alexcoder',
    charCount: 322,
    content:
      'LGTM! Just a few minor suggestions about the examples in the routing section. Consider adding more context about...',
    hasCode: false,
    hasMention: true,
    id: '4',
    kind: 'Review',
    lastEdit: Date.now() - 1000 * 60 * 60 * 24,
    linkCount: 3,
    number: 9012,
    platform: 'GitHub',
    private: true,
    repoSlug: 'vercel/next.js',
    state: { type: 'merged' },
    title: 'Update routing documentation',
    url: 'https://github.com/vercel/next.js/pull/9012',
  },
  {
    account: '@mikeeng',
    charCount: 678,
    content:
      'This PR implements ESM support in worker threads as discussed in the last TSC meeting. The implementation follows...',
    hasCode: true,
    hasMention: true,
    id: '5',
    kind: 'PR',
    lastEdit: Date.now() - 1000 * 60 * 60 * 48,
    linkCount: 5,
    number: 3456,
    platform: 'GitHub',
    private: false,
    repoSlug: 'nodejs/node',
    state: { type: 'closed' },
    title: 'Add support for ESM in worker threads',
    url: 'https://github.com/nodejs/node/pull/3456',
  },
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
  const [privateOnlyFilter, setPrivateOnlyFilter] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('edited-newest')

  const filteredDrafts = useMemo(() => {
    let filtered = [...drafts]
    if (hasCodeFilter) {
      filtered = filtered.filter((d) => d.hasCode)
    }
    if (privateOnlyFilter) {
      filtered = filtered.filter((d) => d.private)
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (d) =>
          d.title.toLowerCase().includes(query) ||
          d.content.toLowerCase().includes(query) ||
          d.repoSlug.toLowerCase().includes(query) ||
          d.number?.toString().includes(query),
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
  }, [drafts, hasCodeFilter, privateOnlyFilter, searchQuery, sortBy])

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

  const getStateIcon = (state: { type: string }) => {
    switch (state.type) {
      case 'open':
        return <Circle className='w-3 h-3 text-sky-500' />
      case 'merged':
        return <CheckCircle2 className='w-3 h-3 text-emerald-500' />
      case 'closed':
        return <XCircle className='w-3 h-3 text-rose-500' />
      case 'post':
        return <MessageSquare className='w-3 h-3 text-slate-500' />
      default:
        return null
    }
  }

  const getKindIcon = (kind: string) => {
    switch (kind) {
      case 'PR':
        return <GitPullRequest className='w-3 h-3' />
      case 'Issue':
        return <Circle className='w-3 h-3' />
      case 'Review':
        return <GitCommit className='w-3 h-3' />
      case 'Comment':
        return <MessageSquare className='w-3 h-3' />
      default:
        return null
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
    (searchQuery ||
      hasCodeFilter ||
      privateOnlyFilter)
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
              setPrivateOnlyFilter(false)
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
        <div className='flex flex-wrap gap-3 items-center'>
          <div className='relative flex-1 max-w-xs'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search drafts...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <label className='flex items-center gap-2 cursor-pointer'>
            <input
              type='checkbox'
              checked={hasCodeFilter}
              onChange={(e) => setHasCodeFilter(e.target.checked)}
              className='rounded'
            />
            <span className='text-sm'>Has code</span>
          </label>
          <label className='flex items-center gap-2 cursor-pointer'>
            <input
              type='checkbox'
              checked={privateOnlyFilter}
              onChange={(e) => setPrivateOnlyFilter(e.target.checked)}
              className='rounded'
            />
            <span className='text-sm'>Private only</span>
          </label>
        </div>

        {/* Bulk actions bar */}
        {selectedIds.size > 0 && (
          <div className='mt-3 p-3 bg-blue-50 rounded-md flex items-center gap-3'>
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
                className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Draft
              </th>
              <th
                scope='col'
                className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                <button
                  type='button'
                  onClick={() => setSortBy(sortBy === 'edited-newest' ? 'edited-oldest' : 'edited-newest')}
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
              <th
                scope='col'
                className='px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {filteredDrafts.map((draft) => (
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
                    <div className='flex items-center gap-1.5 text-xs text-gray-600'>
                      <span className='w-4 h-4 flex items-center justify-center'>
                        {draft.platform === 'GitHub' ? '🐙' : '🔗'}
                      </span>
                      <a
                        href={draft.url}
                        className='hover:underline truncate max-w-[28ch]'
                        title={draft.repoSlug}
                      >
                        {draft.repoSlug}
                      </a>
                      <span className='inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs border border-gray-300'>
                        {draft.private ? (
                          <Lock className='w-3 h-3' />
                        ) : (
                          <Globe className='w-3 h-3' />
                        )}
                        {draft.private ? 'Private' : 'Public'}
                      </span>
                      <span className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs bg-gray-100 border border-gray-300'>
                        {getKindIcon(draft.kind)}
                        {draft.kind}
                      </span>
                      {getStateIcon(draft.state)}
                      <span className='text-gray-500'>{draft.account}</span>
                    </div>

                    {/* Title + snippet */}
                    <div className='text-sm truncate'>
                      <span className='font-medium'>{draft.title}</span>
                      <span className='text-gray-500'> — {draft.content.substring(0, 60)}…</span>
                    </div>

                    {/* Signals row (hidden on small screens) */}
                    <div className='hidden sm:flex items-center gap-2'>
                      {draft.hasCode && (
                        <span className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-700'>
                          <Code className='w-3 h-3' />
                          code
                        </span>
                      )}
                      {draft.hasMention && (
                        <span className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-purple-50 text-purple-700'>
                          <AtSign className='w-3 h-3' />
                          mention
                        </span>
                      )}
                      {draft.linkCount > 0 && (
                        <span className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-green-50 text-green-700'>
                          <Link className='w-3 h-3' />
                          {draft.linkCount}
                        </span>
                      )}
                      <span className='text-xs text-gray-500'>{draft.charCount} chars</span>
                    </div>
                  </div>
                </td>
                <td className='px-3 py-3 text-sm text-gray-500'>
                  <span title={new Date(draft.lastEdit).toLocaleString()}>
                    {timeAgo(new Date(draft.lastEdit))}
                  </span>
                </td>
                <td className='px-3 py-3'>
                  <div className='flex items-center justify-end gap-1'>
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
