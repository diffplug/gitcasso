import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { CommentState } from '@/entrypoints/background'
import { cn } from '@/lib/utils'
import { enhancerRegistry, sampleSpots } from './mockData'

interface SpotRowProps {
  commentState: CommentState
  onClick: () => void
}

function SpotRow({ commentState, onClick }: SpotRowProps) {
  const enhancer = enhancerRegistry.enhancerFor(commentState.spot)

  if (!enhancer) {
    return (
      <TableRow className='cursor-pointer' onClick={onClick}>
        <TableCell className='p-3'>
          <div className='text-red-500'>Unknown spot type: {commentState.spot.type}</div>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <TableRow
      className={cn(
        'cursor-pointer transition-colors hover:bg-slate-50',
        'border-b border-slate-200',
      )}
      onClick={onClick}
    >
      <TableCell className='p-4'>{enhancer.tableRow(commentState.spot)}</TableCell>
    </TableRow>
  )
}

export function TablePlayground() {
  const handleSpotClick = (spot: CommentState) => {
    alert(`Clicked: ${spot.spot.type}\nTab: ${spot.tab.tabId}`)
  }

  return (
    <div className='bg-white rounded-lg shadow-sm border border-slate-200'>
      <div className='p-6 border-b border-slate-200'>
        <h2 className='text-xl font-semibold text-slate-900'>Comment Spots</h2>
        <p className='text-slate-600 text-sm mt-1'>Click on any row to simulate tab switching</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='p-4 font-medium text-slate-700'>Spot Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sampleSpots.map((spot) => (
            <SpotRow
              key={spot.spot.unique_key}
              commentState={spot}
              onClick={() => handleSpotClick(spot)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
