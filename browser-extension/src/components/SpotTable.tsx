import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { CommentStorage } from '@/entrypoints/background'
import type { EnhancerRegistry } from '@/lib/registries'
import { SpotRow } from './SpotRow'

interface SpotTableProps {
  spots: CommentStorage[]
  enhancerRegistry: EnhancerRegistry
  onSpotClick: (spot: CommentStorage) => void
  title?: string
  description?: string
  headerText?: string
  className?: string
  headerClassName?: string
  rowClassName?: string
  cellClassName?: string
  emptyStateMessage?: string
  showHeader?: boolean
}

export function SpotTable({
  spots,
  enhancerRegistry,
  onSpotClick,
  title,
  description,
  headerText = 'Comment Spots',
  className,
  headerClassName = 'p-3 font-medium text-muted-foreground',
  rowClassName,
  cellClassName,
  emptyStateMessage = 'No comment spots available',
  showHeader = true,
}: SpotTableProps) {
  if (spots.length === 0) {
    return <div className='p-10 text-center text-muted-foreground italic'>{emptyStateMessage}</div>
  }

  const tableContent = (
    <Table>
      {showHeader && (
        <TableHeader>
          <TableRow>
            <TableHead className={headerClassName}>{headerText}</TableHead>
          </TableRow>
        </TableHeader>
      )}
      <TableBody>
        {spots.map((spot) => (
          <SpotRow
            key={spot.spot.unique_key}
            commentState={spot}
            enhancerRegistry={enhancerRegistry}
            onClick={() => onSpotClick(spot)}
            className={rowClassName || ''}
            cellClassName={cellClassName || 'p-3'}
          />
        ))}
      </TableBody>
    </Table>
  )

  if (title || description) {
    return (
      <div className={className}>
        {(title || description) && (
          <div className='p-6 border-b border-border'>
            {title && <h2 className='text-xl font-semibold text-foreground'>{title}</h2>}
            {description && <p className='text-muted-foreground text-sm mt-1'>{description}</p>}
          </div>
        )}
        {tableContent}
      </div>
    )
  }

  return <div className={className}>{tableContent}</div>
}
