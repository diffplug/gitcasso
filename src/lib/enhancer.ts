import type { OverTypeInstance } from 'overtype'
import type { ReactNode } from 'react'

/**
 * Stores enough info about the location of a draft to:
 * - display it in a table
 * - reopen the draft in-context
 */
export interface CommentSpot {
  unique_key: string
  type: string
}

export type CommentEventType = 'ENHANCED' | 'LOST_FOCUS' | 'DESTROYED'

export interface CommentEvent {
  type: CommentEventType
  spot: CommentSpot
  draft?: string
}

/**
 * Minimal location information that enhancers need for routing decisions.
 * Avoids dependency on global window/location objects for better testability.
 */
export interface StrippedLocation {
  host: string
  pathname: string
}

/** Wraps the textareas of a given platform with Gitcasso's enhancements. */
export interface CommentEnhancer<Spot extends CommentSpot = CommentSpot> {
  /** Guarantees to only return a type within this list. */
  forSpotTypes(): string[]
  /**
   * Whenever a new `textarea` is added to any webpage, this method is called.
   * If we return non-null, then we become the handler for that text area.
   */
  tryToEnhance(textarea: HTMLTextAreaElement, location: StrippedLocation): Spot | null
  /**
   * If `tryToEnhance` returns non-null, then this gets called.
   */
  enhance(textarea: HTMLTextAreaElement, spot: Spot): OverTypeInstance
  /** Returns a ReactNode which will be displayed in the table row. */
  tableUpperDecoration(spot: Spot): ReactNode
  /** The default title of a row */
  tableTitle(spot: Spot): string
}
