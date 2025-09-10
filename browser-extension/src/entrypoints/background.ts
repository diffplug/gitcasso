import type { CommentDraft, CommentEvent, CommentSpot } from '../lib/enhancer'
import type { GetOpenSpotsResponse, ToBackgroundMessage } from '../lib/messages'
import {
  CLOSE_MESSAGE_PORT,
  isContentToBackgroundMessage,
  isGetOpenSpotsMessage,
  isSwitchToTabMessage,
  KEEP_PORT_OPEN,
} from '../lib/messages'

export interface Tab {
  tabId: number
  windowId: number
}
export interface CommentState {
  tab: Tab
  spot: CommentSpot
  drafts: [number, CommentDraft][]
}

export const openSpots = new Map<string, CommentState>()

export function handleCommentEvent(message: CommentEvent, sender: any): boolean {
  if (
    (message.type === 'ENHANCED' || message.type === 'DESTROYED') &&
    sender.tab?.id &&
    sender.tab?.windowId
  ) {
    if (message.type === 'ENHANCED') {
      const tab: Tab = {
        tabId: sender.tab.id,
        windowId: sender.tab.windowId,
      }
      const commentState: CommentState = {
        drafts: [],
        spot: message.spot,
        tab,
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
    const spots: CommentState[] = []
    for (const [, commentState] of openSpots) {
      spots.push(commentState)
    }
    const response: GetOpenSpotsResponse = { spots }
    sendResponse(response)
    return KEEP_PORT_OPEN
  } else if (isSwitchToTabMessage(message)) {
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
})
