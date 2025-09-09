import type { BackgroundMessage, CommentDraft, CommentSpot } from '../lib/enhancer'
import { JsonMap } from '../lib/jsonmap'

interface Tab {
  tabId: number
  windowId: number
}
interface TabAndSpot {
  tab: Tab
  spot: CommentSpot
}
interface CommentState {
  tab: Tab
  spot: CommentSpot
  drafts: [number, CommentDraft][]
}

const _states = new JsonMap<TabAndSpot, CommentState>()

browser.runtime.onMessage.addListener((message: BackgroundMessage, sender) => {
  if (message.action === 'COMMENT_EVENT' && sender.tab?.id && sender.tab?.windowId) {
    const tab: Tab = {
      tabId: sender.tab.id,
      windowId: sender.tab.windowId,
    }

    const tabAndSpot: TabAndSpot = {
      spot: message.event.spot,
      tab,
    }

    if (message.event.type === 'ENHANCED') {
      const commentState: CommentState = {
        drafts: [],
        spot: message.event.spot,
        tab,
      }
      _states.set(tabAndSpot, commentState)
    } else if (message.event.type === 'DESTROYED') {
      _states.delete(tabAndSpot)
    }
  }
})
