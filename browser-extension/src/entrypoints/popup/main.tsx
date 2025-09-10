import './style.css'
import React from 'react'
import { createRoot } from 'react-dom/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { logger } from '../../lib/logger'
import type {
  GetOpenSpotsMessage,
  GetOpenSpotsResponse,
  SwitchToTabMessage,
} from '../../lib/messages'
import { EnhancerRegistry } from '../../lib/registries'
import type { CommentState } from '../background'

const enhancers = new EnhancerRegistry()

async function getOpenSpots(): Promise<CommentState[]> {
  logger.debug('Sending message to background script...')
  try {
    const message: GetOpenSpotsMessage = { type: 'GET_OPEN_SPOTS' }
    const response = (await browser.runtime.sendMessage(message)) as GetOpenSpotsResponse
    logger.debug('Received response:', response)
    return response.spots || []
  } catch (error) {
    logger.error('Error sending message to background:', error)
    return []
  }
}

function switchToTab(tabId: number, windowId: number): void {
  const message: SwitchToTabMessage = {
    tabId,
    type: 'SWITCH_TO_TAB',
    windowId,
  }
  browser.runtime.sendMessage(message)
  window.close()
}

interface SpotRowProps {
  commentState: CommentState
  onClick: () => void
}

function SpotRow({ commentState, onClick }: SpotRowProps) {
  const enhancer = enhancers.enhancerFor(commentState.spot)

  if (!enhancer) {
    logger.error('No enhancer found for:', commentState.spot)
    logger.error('Only have enhancers for:', enhancers.byType)
    return null
  }

  return (
    <TableRow
      className={cn(
        'cursor-pointer transition-colors hover:bg-muted/50',
        'border-b border-border/40',
      )}
      onClick={onClick}
    >
      <TableCell className='p-3'>
        <div className='flex items-center gap-2'>
          <div className='font-medium text-sm text-foreground overflow-hidden text-ellipsis whitespace-nowrap'>
            {enhancer.tableRow(commentState.spot)}
          </div>
        </div>
      </TableCell>
    </TableRow>
  )
}

function PopupApp() {
  const [spots, setSpots] = React.useState<CommentState[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const loadSpots = async () => {
      try {
        const openSpots = await getOpenSpots()
        setSpots(openSpots)
      } catch (error) {
        logger.error('Error loading spots:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSpots()
  }, [])

  if (isLoading) {
    return <div className='p-4 text-center text-muted-foreground'>Loading...</div>
  }

  if (spots.length === 0) {
    return (
      <div className='p-10 text-center text-muted-foreground italic'>No open comment spots</div>
    )
  }

  return (
    <div className='w-full'>
      <h2 className='mb-4 text-lg font-semibold text-foreground'>Open Comment Spots</h2>

      <div className='border rounded-md'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='p-3 font-medium text-muted-foreground'>Comment Spots</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {spots.map((spot) => (
              <SpotRow
                key={spot.spot.unique_key}
                commentState={spot}
                onClick={() => switchToTab(spot.tab.tabId, spot.tab.windowId)}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// Initialize React app
const app = document.getElementById('app')
if (app) {
  const root = createRoot(app)
  root.render(<PopupApp />)
} else {
  logger.error('App element not found')
}
