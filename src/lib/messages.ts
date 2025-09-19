import type { CommentTableRow } from '@/entrypoints/background'
import type { CommentEvent, CommentEventType } from './enhancer'

// Message handler response types
export const CLOSE_MESSAGE_PORT = false as const // No response will be sent
export const KEEP_PORT_OPEN = true as const // Response will be sent (possibly async)

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
export interface GetTableRowsResponse {
  rows: CommentTableRow[]
}

// Exhaustive list of valid comment event types - TypeScript will error if CommentEventType changes
const COMMENT_EVENT_TYPES = {
  DESTROYED: true,
  ENHANCED: true,
  LOST_FOCUS: true,
} as const satisfies Record<CommentEventType, true>

// Helper function to check if a string is a valid CommentEventType
function isValidCommentEventType(type: string): type is CommentEventType {
  return type in COMMENT_EVENT_TYPES
}

// Type guard functions
export function isContentToBackgroundMessage(message: any): message is ContentToBackgroundMessage {
  return (
    message &&
    typeof message.type === 'string' &&
    isValidCommentEventType(message.type) &&
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
  ): Promise<T extends GetOpenSpotsMessage ? GetTableRowsResponse : void>
}
