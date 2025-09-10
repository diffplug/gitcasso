import './style.css'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { SpotTable } from '@/components/SpotTable'
import type { CommentState } from '@/entrypoints/background'
import { logger } from '@/lib/logger'
import type { GetOpenSpotsMessage, GetOpenSpotsResponse, SwitchToTabMessage } from '@/lib/messages'
import { EnhancerRegistry } from '@/lib/registries'

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

const enhancers = new EnhancerRegistry()

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

  const handleSpotClick = (spot: CommentState) => {
    switchToTab(spot.tab.tabId, spot.tab.windowId)
  }

  return (
    <div className='w-full'>
      <h2 className='mb-4 text-lg font-semibold text-foreground'>Open Comment Spots</h2>

      <div className='border rounded-md'>
        <SpotTable
          spots={spots}
          enhancerRegistry={enhancers}
          onSpotClick={handleSpotClick}
          headerClassName='p-3 font-medium text-muted-foreground'
          rowClassName='transition-colors hover:bg-muted/50 border-b border-border/40'
          cellClassName='p-3'
          emptyStateMessage='No open comment spots'
          showHeader={true}
        />
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
