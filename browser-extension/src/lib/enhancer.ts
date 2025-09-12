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

/** Wraps the textareas of a given platform with Gitcasso's enhancements. */
export interface CommentEnhancer<Spot extends CommentSpot = CommentSpot> {
  /** Guarantees to only return a type within this list. */
  forSpotTypes(): string[]
  /**
   * Whenever a new `textarea` is added to any webpage, this method is called.
   * If we return non-null, then we become the handler for that text area.
   */
  tryToEnhance(textarea: HTMLTextAreaElement): Spot | null
  /** This gets called the first time that `tryToEnhance` returns non-null. */
  prepareForFirstEnhancement(): void
  /**
   * If `tryToEnhance` returns non-null, then this gets called.
   * It is guaranteed that `prepareForFirstEnhancement` has been called
   * exactly once since pageload before this gets called.
   */
  enhance(textarea: HTMLTextAreaElement, spot: Spot): OverTypeInstance
  /** Returns a ReactNode which will be displayed in the table row. */
  tableRow(spot: Spot): ReactNode
}
