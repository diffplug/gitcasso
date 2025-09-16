import { TableCell, TableRow } from '@/components/ui/table'
import type { CommentStorage } from '@/entrypoints/background'
import type { EnhancerRegistry } from '@/lib/registries'
import { cn } from '@/lib/utils'

interface SpotRowProps {
  commentState: CommentStorage
  enhancerRegistry: EnhancerRegistry
  onClick: () => void
  className?: string
  cellClassName?: string
  errorClassName?: string
}

export function SpotRow({
  commentState,
  enhancerRegistry,
  onClick,
  className,
  cellClassName = 'p-3',
  errorClassName = 'text-red-500',
}: SpotRowProps) {
  const enhancer = enhancerRegistry.enhancerFor(commentState.spot)

  if (!enhancer) {
    return (
      <TableRow className={cn('cursor-pointer', className)} onClick={onClick}>
        <TableCell className={cellClassName}>
          <div className={errorClassName}>Unknown spot type: {commentState.spot.type}</div>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <TableRow className={cn('cursor-pointer', className)} onClick={onClick}>
      <TableCell className={cellClassName}>
        {enhancer.tableUpperDecoration(commentState.spot)}
      </TableCell>
    </TableRow>
  )
}
