import { GitPullRequestIcon, IssueOpenedIcon } from '@primer/octicons-react'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  Clock,
  Code,
  Eye,
  EyeOff,
  Image,
  Link,
  MailCheck,
  MessageSquareDashed,
  Monitor,
  Search,
  Settings,
  TextSelect,
  Trash2,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import {
  type CommentTableRow,
  generateMockDrafts,
  isGitHubDraft,
  isRedditDraft,
} from './replicaData'

interface FilterState {
  sentFilter: 'both' | 'sent' | 'unsent'
  searchQuery: string
  showTrashed: boolean
}

// CVA configuration for stat badges
const statBadge = cva(
  'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-normal h-5',
  {
    defaultVariants: {
      clickable: false,
    },
    variants: {
      clickable: {
        false: '',
        true: 'cursor-pointer border border-transparent hover:border-current border-dashed',
      },
      selected: {
        false: '',
        true: '!border-solid !border-current',
      },
      type: {
        blank: 'bg-transparent text-gray-700',
        code: 'bg-pink-50 text-pink-700',
        hideTrashed: 'bg-transparent text-gray-700',
        image: 'bg-purple-50 text-purple-700',
        link: 'bg-blue-50 text-blue-700',
        open: 'bg-cyan-50 text-cyan-700',
        sent: 'bg-green-50 text-green-700',
        settings: 'bg-gray-50 text-gray-700',
        text: 'bg-gray-50 text-gray-700',
        time: 'bg-gray-50 text-gray-700',
        trashed: 'bg-gray-50 text-yellow-700',
        unsent: 'bg-amber-100 text-amber-700',
      },
    },
  },
)

// Map types to their icons
const typeIcons = {
  blank: Code,
  code: Code,
  hideTrashed: EyeOff,
  image: Image,
  link: Link,
  open: Monitor,
  sent: MailCheck,
  settings: Settings,
  text: TextSelect,
  time: Clock,
  trashed: Trash2,
  unsent: MessageSquareDashed,
} as const

// StatBadge component
type BadgeProps = VariantProps<typeof statBadge> & {
  type: keyof typeof typeIcons
  text?: number | string
}

const Badge = ({ text, type }: BadgeProps) => {
  const Icon = typeIcons[type]
  return (
    <span
      className={twMerge(
        statBadge({
          type,
        }),
      )}
    >
      {type === 'blank' || <Icon className='w-3 h-3' />}
      {text || type}
    </span>
  )
}

interface Segment<T> {
  text?: string
  type: keyof typeof typeIcons
  value: T
}
interface MultiSegmentProps<T> {
  segments: Segment<T>[]
  value: T
  onValueChange: (value: T) => void
}

const MultiSegment = <T,>({ segments, value, onValueChange }: MultiSegmentProps<T>) => {
  return (
    <div className='inline-flex items-center gap-0'>
      {segments.map((segment, index) => {
        const Icon = typeIcons[segment.type]
        const isFirst = index === 0
        const isLast = index === segments.length - 1

        const roundedClasses =
          isFirst && isLast
            ? ''
            : isFirst
              ? '!rounded-r-none'
              : isLast
                ? '!rounded-l-none'
                : '!rounded-none'

        return (
          <button
            key={String(segment.value)}
            className={`${statBadge({
              clickable: true,
              selected: value === segment.value,
              type: segment.type,
            })} ${roundedClasses}`}
            onClick={() => onValueChange(segment.value)}
            type='button'
          >
            {segment.type === 'blank' || <Icon className='w-3 h-3' />}
            {segment.text}
          </button>
        )
      })}
    </div>
  )
}

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
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    sentFilter: 'both',
    showTrashed: false,
  })

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const filteredDrafts = useMemo(() => {
    let filtered = [...drafts]
    if (!filters.showTrashed) {
      filtered = filtered.filter((d) => !d.isTrashed)
    }
    if (filters.sentFilter !== 'both') {
      filtered = filtered.filter((d) => (filters.sentFilter === 'sent' ? d.isSent : !d.isSent))
    }
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter((d) =>
        [d.spot.title, d.latestDraft.content, (d.spot as any).slug, (d.spot as any).subreddit].some(
          (value) => value && String(value).toLowerCase().includes(query),
        ),
      )
    }
    // sort by newest
    filtered.sort((a, b) => b.latestDraft.time - a.latestDraft.time)
    return filtered
  }, [drafts, filters])

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
      setSelectedIds(new Set(filteredDrafts.map((d) => d.spot.unique_key)))
    }
  }

  const handleOpen = (url: string) => {
    window.open(url, '_blank')
  }

  const handleTrash = (row: CommentTableRow) => {
    if (row.latestDraft.stats.charCount > 20) {
      if (confirm('Are you sure you want to discard this draft?')) {
        console.log('Trashing draft:', row.spot.unique_key)
      }
    } else {
      console.log('Trashing draft:', row.spot.unique_key)
    }
  }

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      sentFilter: 'both',
      showTrashed: true,
    })
  }

  const getTableBody = () => {
    if (drafts.length === 0) {
      return <EmptyState />
    }

    if (filteredDrafts.length === 0 && (filters.searchQuery || filters.sentFilter !== 'both')) {
      return <NoMatchesState onClearFilters={clearFilters} />
    }

    return filteredDrafts.map((row) =>
      commentRow(row, selectedIds, toggleSelection, handleOpen, handleTrash),
    )
  }

  return (
    <div className='bg-white'>
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

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='w-full table-fixed table-fixed'>
          <colgroup>
            <col className='w-10' />
            <col />
          </colgroup>
          <thead className='border-b border-gray-400'>
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
              <th scope='col' className='px-3 py-3 text-left text-xs text-gray-500'>
                <div className='relative'>
                  <div className='flex items-center gap-1'>
                    <div className='relative flex-1'>
                      <Search className='absolute left-1 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                      <input
                        type='text'
                        placeholder='Search drafts...'
                        value={filters.searchQuery}
                        onChange={(e) => updateFilter('searchQuery', e.target.value)}
                        className='w-full pl-5 pr-3 h-5 border border-gray-300 rounded-sm text-sm font-normal focus:outline-none focus:border-blue-500'
                      />
                    </div>
                    <div className='relative flex overflow-hidden gap-1'>
                      <button
                        type='button'
                        onClick={() => updateFilter('showTrashed', !filters.showTrashed)}
                        className={twMerge(
                          statBadge({
                            clickable: true,
                            type: filters.showTrashed ? 'trashed' : 'hideTrashed',
                          }),
                          'border',
                        )}
                      >
                        <Trash2 className='w-3 h-3' />
                        {filters.showTrashed ? (
                          <Eye className='w-3 h-3' />
                        ) : (
                          <EyeOff className='w-3 h-3' />
                        )}
                      </button>
                      <MultiSegment<FilterState['sentFilter']>
                        value={filters.sentFilter}
                        onValueChange={(value) => updateFilter('sentFilter', value)}
                        segments={[
                          {
                            text: '',
                            type: 'unsent',
                            value: 'unsent',
                          },
                          {
                            text: 'both',
                            type: 'blank',
                            value: 'both',
                          },
                          {
                            text: '',
                            type: 'sent',
                            value: 'sent',
                          },
                        ]}
                      />
                      <button
                        type='button'
                        className={twMerge(
                          statBadge({
                            clickable: true,
                            type: 'settings',
                          }),
                          'border',
                        )}
                      >
                        <Settings className='w-3 h-3' />
                      </button>
                    </div>
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>{getTableBody()}</tbody>
        </table>
      </div>
    </div>
  )
}

function commentRow(
  row: CommentTableRow,
  selectedIds: Set<unknown>,
  toggleSelection: (id: string) => void,
  _handleOpen: (url: string) => void,
  _handleTrash: (row: CommentTableRow) => void,
) {
  return (
    <tr key={row.spot.unique_key} className='hover:bg-gray-50'>
      <td className='px-3 py-3'>
        <input
          type='checkbox'
          checked={selectedIds.has(row.spot.unique_key)}
          onChange={() => toggleSelection(row.spot.unique_key)}
          className='rounded'
        />
      </td>
      <td className='px-3 py-3'>
        <div className='space-y-1'>
          {/* Context line */}
          <div className='flex items-center justify-between gap-1.5 text-xs text-gray-600'>
            <div className='flex items-center gap-1.5 min-w-0 flex-1'>
              <span className='w-4 h-4 flex items-center justify-center flex-shrink-0'>
                {row.spot.type === 'GH_PR_ADD_COMMENT' && <GitPullRequestIcon size={16} />}
                {row.spot.type === 'GH_ISSUE_ADD_COMMENT' && <IssueOpenedIcon size={16} />}
                {row.spot.type === 'REDDIT' && (
                  <img
                    src='https://styles.redditmedia.com/t5_2fwo/styles/communityIcon_1bqa1ibfp8q11.png?width=128&frame=1&auto=webp&s=400b33e7080aa4996c405a96b3872a12f0e3b68d'
                    alt='Reddit'
                    className='w-4 h-4 rounded-full'
                  />
                )}
              </span>

              {isGitHubDraft(row.spot) && (
                <>
                  #{row.spot.number}
                  <a href='TODO' className='hover:underline truncate'>
                    {row.spot.slug}
                  </a>
                </>
              )}
              {isRedditDraft(row.spot) && (
                <a href={'TODO'} className='hover:underline truncate'>
                  r/{row.spot.subreddit}
                </a>
              )}
            </div>
            <div className='flex items-center gap-1 flex-shrink-0'>
              {row.latestDraft.stats.links.length > 0 && (
                <Badge type='link' text={row.latestDraft.stats.links.length} />
              )}
              {row.latestDraft.stats.images.length > 0 && (
                <Badge type='image' text={row.latestDraft.stats.images.length} />
              )}
              {row.latestDraft.stats.codeBlocks.length > 0 && (
                <Badge type='code' text={row.latestDraft.stats.codeBlocks.length} />
              )}
              <Badge type='text' text={row.latestDraft.stats.charCount} />
              <Badge type='time' text={timeAgo(row.latestDraft.time)} />
              {row.isOpenTab && <Badge type='open' />}
            </div>
          </div>

          {/* Title */}
          <div className='flex items-center gap-1'>
            <a href='TODO' className='text-sm font-medium  hover:underline truncate'>
              {row.spot.title}
            </a>
            <Badge type={row.isSent ? 'sent' : 'unsent'} />
            {row.isTrashed && <Badge type='trashed' />}
          </div>
          {/* Draft */}
          <div className='text-sm truncate'>
            <span className='text-gray-500'>{row.latestDraft.content.substring(0, 100)}…</span>
          </div>
        </div>
      </td>
    </tr>
  )
}

const EmptyState = () => (
  <div className='max-w-4xl mx-auto text-center py-16'>
    <h2 className='text-2xl font-semibold mb-4'>No comments open</h2>
    <p className='text-gray-600 mb-6'>
      Your drafts will appear here when you start typing in comment boxes across GitHub and Reddit.
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
)

const NoMatchesState = ({ onClearFilters }: { onClearFilters: () => void }) => (
  <div className='text-center py-16'>
    <p className='text-gray-600 mb-4'>No matches found</p>
    <button type='button' onClick={onClearFilters} className='text-blue-600 hover:underline'>
      Clear filters
    </button>
  </div>
)
