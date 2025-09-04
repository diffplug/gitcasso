import type { OverType } from '../overtype/mock-overtype'

/**
 * stores enough info about the location of a draft to:
 * - display it in a table
 * - reopen the draft in-context
 */
export interface CommentSpot {
  unique_key: string
  type: string
}

/** wraps the textareas of a given platform with Gitcasso's enhancements */
export interface CommentEnhancer<T extends CommentSpot = CommentSpot> {
  /** guarantees to only return a type within this list */
  forCommentTypes(): string[]
  /**
   * whenever a new `textarea` is added to any webpage, this method is called.
   * if we return non-null, then we become the handler for that text area.
   */
  tryToEnhance(textarea: HTMLTextAreaElement): [OverType, T] | null

  generateIcon(context: T): string
  generateDisplayTitle(context: T): string
  buildUrl(context: T, withDraft?: boolean): string
}
