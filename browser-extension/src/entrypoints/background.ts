import type { CommentDraft, CommentEvent, CommentSpot } from '../lib/enhancer'
import { JsonMap } from '../lib/jsonmap'

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

export function handleCommentEvent(message: CommentEvent, sender: any): void {
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
    }
  }
}

export function handlePopupMessage(message: any, sender: any, sendResponse: (response: any) => void): void {
  if (message.type === 'GET_OPEN_SPOTS') {
    const spots: CommentState[] = []
    for (const [, commentState] of openSpots) {
      spots.push(commentState)
    }
    sendResponse({ spots })
  }
}

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_OPEN_SPOTS') {
      handlePopupMessage(message, sender, sendResponse)
      return true
    } else {
      handleCommentEvent(message, sender)
      return false
    }
  })
})
