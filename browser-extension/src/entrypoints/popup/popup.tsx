import './style.css'
import React from 'react'
import { createRoot } from 'react-dom/client'
import type { CommentTableRow } from '@/entrypoints/background'
import { logger } from '@/lib/logger'
import type { GetOpenSpotsMessage, GetTableRowsResponse } from '@/lib/messages'

async function getOpenSpots(): Promise<CommentTableRow[]> {
  logger.debug('Sending message to background script...')
  try {
    const message: GetOpenSpotsMessage = { type: 'GET_OPEN_SPOTS' }
    const response = (await browser.runtime.sendMessage(message)) as GetTableRowsResponse
    logger.debug('Received response:', response)
    return response.rows || []
  } catch (error) {
    logger.error('Error sending message to background:', error)
    return []
  }
}

// function switchToTab(tabId: number, windowId: number): void {
//   const message: SwitchToTabMessage = {
//     tabId,
//     type: 'SWITCH_TO_TAB',
//     windowId,
//   }
//   browser.runtime.sendMessage(message)
//   window.close()
// }

export interface FilterState {
  sentFilter: 'both' | 'sent' | 'unsent'
  searchQuery: string
  showTrashed: boolean
}

function PopupApp() {
  const [_spots, setSpots] = React.useState<CommentTableRow[]>([])
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

  // const handleSpotClick = (spot: CommentTableRow) => {
  //   console.log('TODO: switchToTab')
  //   //switchToTab(spot.tab.tabId, spot.tab.windowId)
  // }

  return (
    <div className='w-full'>
      <h2 className='mb-4 text-lg font-semibold text-foreground'>Open Comment Spots</h2>

      <div className='border rounded-md'></div>
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
