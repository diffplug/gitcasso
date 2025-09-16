import './style.css'
import { createRoot } from 'react-dom/client'
import { PopupRoot } from '@/components/PopupRoot'
import type { CommentTableRow } from '@/entrypoints/background'
import { logger } from '@/lib/logger'
import type { GetOpenSpotsMessage, GetTableRowsResponse } from '@/lib/messages'

export interface FilterState {
  sentFilter: 'both' | 'sent' | 'unsent'
  searchQuery: string
  showTrashed: boolean
}

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

// const handleSpotClick = (spot: CommentTableRow) => {
//   console.log('TODO: switchToTab')
//   //switchToTab(spot.tab.tabId, spot.tab.windowId)
// }

const app = document.getElementById('app')
if (app) {
  const root = createRoot(app)

  // Load initial data and render
  getOpenSpots()
    .then((drafts) => {
      root.render(<PopupRoot drafts={drafts} />)
    })
    .catch((error) => {
      logger.error('Failed to load initial data:', error)
      root.render(<PopupRoot drafts={[]} />)
    })
} else {
  logger.error('App element not found')
}
