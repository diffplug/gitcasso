import type { CommentDraft, CommentEvent, CommentSpot } from '../lib/enhancer'
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

const states = new JsonMap<TabAndSpot, CommentState>()
browser.runtime.onMessage.addListener((message: CommentEvent, sender) => {
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
      states.set(tabAndSpot, commentState)
    } else if (message.type === 'DESTROYED') {
      states.delete(tabAndSpot)
    }
  }
})
