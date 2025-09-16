import { Eye, EyeOff, Search, Settings, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import Badge from '@/components/Badge'
import { badgeCVA } from '@/components/design'
import MultiSegment from '@/components/MultiSegment'
import { allLeafValues, timeAgo } from '@/components/misc'
import type { CommentTableRow } from '@/entrypoints/background'
import type { FilterState } from '@/entrypoints/popup/popup'
import { EnhancerRegistry } from '@/lib/registries'
import { generateMockDrafts } from './replicaData'

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
      filtered = filtered.filter((d) => {
        for (const value of allLeafValues(d)) {
          if (value.toLowerCase().includes(query)) {
            return true // Early exit on first match
          }
        }
        return false
      })
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
        <div className='-translate-x-1/2 fixed bottom-6 left-1/2 z-50 flex transform items-center gap-3 rounded-md border border-blue-200 bg-blue-50 p-3 shadow-lg'>
          <span className='font-medium text-sm'>{selectedIds.size} selected</span>
          <button type='button' className='text-blue-600 text-sm hover:underline'>
            Copy
          </button>
          <button type='button' className='text-blue-600 text-sm hover:underline'>
            Preview
          </button>
          <button type='button' className='text-blue-600 text-sm hover:underline'>
            Discard
          </button>
          <button type='button' className='text-blue-600 text-sm hover:underline'>
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
          <thead className='border-gray-400 border-b'>
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
              <th scope='col' className='px-3 py-3 text-left text-gray-500 text-xs'>
                <div className='relative'>
                  <div className='flex items-center gap-1'>
                    <div className='relative flex-1'>
                      <Search className='-translate-y-1/2 absolute top-1/2 left-1 h-4 w-4 text-gray-400' />
                      <input
                        type='text'
                        placeholder='Search drafts...'
                        value={filters.searchQuery}
                        onChange={(e) => updateFilter('searchQuery', e.target.value)}
                        className='h-5 w-full rounded-sm border border-gray-300 pr-3 pl-5 font-normal text-sm focus:border-blue-500 focus:outline-none'
                      />
                    </div>
                    <div className='relative flex gap-1 overflow-hidden'>
                      <button
                        type='button'
                        onClick={() => updateFilter('showTrashed', !filters.showTrashed)}
                        className={twMerge(
                          badgeCVA({
                            clickable: true,
                            type: filters.showTrashed ? 'trashed' : 'hideTrashed',
                          }),
                          'border',
                        )}
                      >
                        <Trash2 className='h-3 w-3' />
                        {filters.showTrashed ? (
                          <Eye className='h-3 w-3' />
                        ) : (
                          <EyeOff className='h-3 w-3' />
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
                          badgeCVA({
                            clickable: true,
                            type: 'settings',
                          }),
                          'border',
                        )}
                      >
                        <Settings className='h-3 w-3' />
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

const enhancers = new EnhancerRegistry()
function commentRow(
  row: CommentTableRow,
  selectedIds: Set<unknown>,
  toggleSelection: (id: string) => void,
  _handleOpen: (url: string) => void,
  _handleTrash: (row: CommentTableRow) => void,
) {
  const enhancer = enhancers.enhancerFor(row.spot)
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
          <div className='flex items-center justify-between gap-1.5 text-gray-600 text-xs'>
            <div className='flex min-w-0 flex-1 items-center gap-1.5'>
              {enhancer.tableUpperDecoration(row.spot)}
            </div>
            <div className='flex flex-shrink-0 items-center gap-1'>
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
            <a href='TODO' className='truncate font-medium text-sm hover:underline'>
              {enhancer.tableTitle(row.spot)}
            </a>
            <Badge type={row.isSent ? 'sent' : 'unsent'} />
            {row.isTrashed && <Badge type='trashed' />}
          </div>
          {/* Draft */}
          <div className='truncate text-sm'>
            <span className='text-gray-500'>{row.latestDraft.content.substring(0, 100)}…</span>
          </div>
        </div>
      </td>
    </tr>
  )
}

const EmptyState = () => (
  <div className='mx-auto max-w-4xl py-16 text-center'>
    <h2 className='mb-4 font-semibold text-2xl'>No comments open</h2>
    <p className='mb-6 text-gray-600'>
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
  <div className='py-16 text-center'>
    <p className='mb-4 text-gray-600'>No matches found</p>
    <button type='button' onClick={onClearFilters} className='text-blue-600 hover:underline'>
      Clear filters
    </button>
  </div>
)
