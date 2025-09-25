import Badge from '@/components/Badge'
import { timeAgo } from '@/components/misc'
import type { CommentTableRow } from '@/entrypoints/background'
import { EnhancerRegistry } from '@/lib/registries'

const enhancers = new EnhancerRegistry()

type CommentRowProps = {
  row: CommentTableRow
  selectedIds: Set<unknown>
  toggleSelection: (id: string) => void
  handleOpen: (url: string) => void
  handleTrash: (row: CommentTableRow) => void
}

export function CommentRow({ row, selectedIds, toggleSelection }: CommentRowProps) {
  const enhancer = enhancers.enhancerFor(row.spot)
  return (
    <tr className='hover:bg-gray-50'>
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
              {row.isOpenTab && <Badge type='open' data={{ uniqueKey: row.spot.unique_key }} />}
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
