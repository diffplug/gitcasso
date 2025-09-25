import type { CommentEvent, CommentEventType, CommentSpot } from '@/lib/enhancer'
import { type DraftStats, statsFor } from '@/lib/enhancers/draft-stats'
import { logger } from '@/lib/logger'
import type { GetTableRowsResponse, ToBackgroundMessage } from '@/lib/messages'
import {
  CLOSE_MESSAGE_PORT,
  isContentToBackgroundMessage,
  isGetOpenSpotsMessage,
  isOpenOrFocusMessage,
  KEEP_PORT_OPEN,
} from '@/lib/messages'

export interface Tab {
  tabId: number
  windowId: number
}
export interface CommentStorage {
  tab: Tab
  spot: CommentSpot
  drafts: [number, string][]
  sentOn: number | null
  trashedOn: number | null
}
interface Draft {
  content: string
  time: number
  stats: DraftStats
}
export interface CommentTableRow {
  spot: CommentSpot
  latestDraft: Draft
  isOpenTab: boolean
  isSent: boolean
  isTrashed: boolean
}

export const openSpots = new Map<string, CommentStorage>()

export function handleCommentEvent(message: CommentEvent, sender: any): boolean {
  logger.debug('received comment event', message)

  // Only process events with valid tab information
  if (!sender.tab?.id || !sender.tab?.windowId) {
    return CLOSE_MESSAGE_PORT
  }

  switch (message.type) {
    case 'ENHANCED': {
      const commentState: CommentStorage = {
        drafts: [[Date.now(), message.draft || '']],
        sentOn: null,
        spot: message.spot,
        tab: {
          tabId: sender.tab.id,
          windowId: sender.tab.windowId,
        },
        trashedOn: null,
      }
      openSpots.set(message.spot.unique_key, commentState)
      break
    }
    case 'DESTROYED': {
      openSpots.delete(message.spot.unique_key)
      break
    }
    case 'LOST_FOCUS': {
      // Update the draft content for existing comment state
      const existingState = openSpots.get(message.spot.unique_key)
      if (existingState) {
        existingState.drafts.push([Date.now(), message.draft || ''])
      }
      break
    }
    default: {
      // TypeScript exhaustiveness check - will error if we miss any CommentEventType
      const exhaustiveCheck: never = message.type satisfies CommentEventType
      throw new Error(`Unhandled comment event type: ${exhaustiveCheck}`)
    }
  }

  return CLOSE_MESSAGE_PORT
}

export function handlePopupMessage(
  message: any,
  _sender: any,
  sendResponse: (response: any) => void,
): typeof CLOSE_MESSAGE_PORT | typeof KEEP_PORT_OPEN {
  if (isGetOpenSpotsMessage(message)) {
    logger.debug('received open spots message', message)
    const rows: CommentTableRow[] = Array.from(openSpots.values()).map((storage) => {
      const [time, content] = storage.drafts.at(-1)!
      const row: CommentTableRow = {
        isOpenTab: true,
        isSent: storage.sentOn != null,
        isTrashed: storage.trashedOn != null,
        latestDraft: {
          content,
          stats: statsFor(content),
          time,
        },
        spot: storage.spot,
      }
      return row
    })
    const response: GetTableRowsResponse = { rows }
    sendResponse(response)
    return KEEP_PORT_OPEN
  } else if (isOpenOrFocusMessage(message)) {
    logger.debug('received switch tab message', message)
    const storage = openSpots.get(message.uniqueKey)
    if (storage) {
      browser.windows
        .update(storage.tab.windowId, { focused: true })
        .then(() => {
          return browser.tabs.update(storage.tab.tabId, { active: true })
        })
        .catch((error) => {
          console.error('Error switching to tab:', error)
        })
    } else {
      console.error('TODO: implement opening a previous comment', message.uniqueKey)
    }
    return CLOSE_MESSAGE_PORT
  } else {
    logger.error('received unknown message', message)
    throw new Error(`Unhandled popup message type: ${message?.type || 'unknown'}`)
  }
}

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message: ToBackgroundMessage, sender, sendResponse) => {
    if (isContentToBackgroundMessage(message)) {
      return handleCommentEvent(message, sender)
    } else {
      return handlePopupMessage(message, sender, sendResponse)
    }
  })

  browser.tabs.onRemoved.addListener((tabId: number) => {
    logger.debug('tab removed', { tabId })

    // Clean up openSpots entries for the closed tab
    for (const [key, value] of openSpots) {
      if (tabId === value.tab.tabId) {
        openSpots.delete(key)
        logger.debug('closed tab which contained spot', value.spot.unique_key)
      }
    }
  })
})
