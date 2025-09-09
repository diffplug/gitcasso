import type { CommentDraft, CommentEvent, CommentSpot } from './enhancer'

// Content -> Background messages (already well-typed as CommentEvent)
export type ContentToBackgroundMessage = CommentEvent

// Popup -> Background messages
export interface GetOpenSpotsMessage {
  type: 'GET_OPEN_SPOTS'
}

export interface SwitchToTabMessage {
  type: 'SWITCH_TO_TAB'
  tabId: number
  windowId: number
}

export type PopupToBackgroundMessage = GetOpenSpotsMessage | SwitchToTabMessage

// All messages sent to background
export type ToBackgroundMessage = ContentToBackgroundMessage | PopupToBackgroundMessage

// Background -> Popup responses
export interface GetOpenSpotsResponse {
  spots: Array<{
    tab: {
      tabId: number
      windowId: number
    }
    spot: CommentSpot
    drafts: Array<[number, CommentDraft]>
  }>
}

// Type guard functions
export function isContentToBackgroundMessage(message: any): message is ContentToBackgroundMessage {
  return (
    message &&
    typeof message.type === 'string' &&
    (message.type === 'ENHANCED' || message.type === 'DESTROYED') &&
    message.spot
  )
}

export function isPopupToBackgroundMessage(message: any): message is PopupToBackgroundMessage {
  return (
    message &&
    typeof message.type === 'string' &&
    (message.type === 'GET_OPEN_SPOTS' || message.type === 'SWITCH_TO_TAB')
  )
}

export function isGetOpenSpotsMessage(message: any): message is GetOpenSpotsMessage {
  return message && message.type === 'GET_OPEN_SPOTS'
}

export function isSwitchToTabMessage(message: any): message is SwitchToTabMessage {
  return (
    message &&
    message.type === 'SWITCH_TO_TAB' &&
    typeof message.tabId === 'number' &&
    typeof message.windowId === 'number'
  )
}

// Message handler types
export type BackgroundMessageHandler = (
  message: ToBackgroundMessage,
  sender: any,
  sendResponse: (response?: any) => void,
) => boolean | undefined

export type PopupMessageSender = {
  sendMessage<T extends PopupToBackgroundMessage>(
    message: T,
  ): Promise<T extends GetOpenSpotsMessage ? GetOpenSpotsResponse : void>
}
