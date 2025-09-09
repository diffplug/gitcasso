import type { CommentDraft, CommentEvent, CommentSpot } from '../lib/enhancer'
import { JsonMap } from '../lib/jsonmap'
import type { GetOpenSpotsResponse, ToBackgroundMessage } from '../lib/messages'
import {
  isContentToBackgroundMessage,
  isGetOpenSpotsMessage,
  isSwitchToTabMessage,
  CLOSE_MESSAGE_PORT,
  KEEP_PORT_OPEN,
} from '../lib/messages'

export interface Tab {
  tabId: number
  windowId: number
}
export interface TabAndSpot {
  tab: Tab
  spot: CommentSpot
}
export interface CommentState {
  tab: Tab
  spot: CommentSpot
  drafts: [number, CommentDraft][]
}

export const openSpots = new JsonMap<TabAndSpot, CommentState>()

export function handleCommentEvent(message: CommentEvent, sender: any): boolean {
  if (
    (message.type === 'ENHANCED' || message.type === 'DESTROYED') &&
    sender.tab?.id &&
    sender.tab?.windowId
  ) {
    const tab: Tab = {
      tabId: sender.tab.id,
      windowId: sender.tab.windowId,
    }
    const tabAndSpot: TabAndSpot = {
      spot: message.spot,
      tab,
    }
    if (message.type === 'ENHANCED') {
      const commentState: CommentState = {
        drafts: [],
        spot: message.spot,
        tab,
      }
      openSpots.set(tabAndSpot, commentState)
    } else if (message.type === 'DESTROYED') {
      openSpots.delete(tabAndSpot)
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
