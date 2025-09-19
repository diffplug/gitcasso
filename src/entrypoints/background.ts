import type { CommentEvent, CommentSpot } from '@/lib/enhancer'
import { type DraftStats, statsFor } from '@/lib/enhancers/draft-stats'
import { logger } from '@/lib/logger'
import type { GetTableRowsResponse, ToBackgroundMessage } from '@/lib/messages'
import {
  CLOSE_MESSAGE_PORT,
  isContentToBackgroundMessage,
  isGetOpenSpotsMessage,
  isSwitchToTabMessage,
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
  if (
    (message.type === 'ENHANCED' || message.type === 'DESTROYED') &&
    sender.tab?.id &&
    sender.tab?.windowId
  ) {
    if (message.type === 'ENHANCED') {
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
    } else if (message.type === 'DESTROYED') {
      openSpots.delete(message.spot.unique_key)
    } else {
      throw new Error(`Unhandled comment event type: ${message.type}`)
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
  } else if (isSwitchToTabMessage(message)) {
    logger.debug('received switch tab message', message)
    browser.windows
      .update(message.windowId, { focused: true })
      .then(() => {
        return browser.tabs.update(message.tabId, { active: true })
      })
      .catch((error) => {
        console.error('Error switching to tab:', error)
      })
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
