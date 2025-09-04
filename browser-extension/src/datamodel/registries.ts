import type { OverType } from '../overtype/mock-overtype'
import type { CommentEnhancer, CommentSpot } from './enhancer'
import { GitHubHandler as GitHubEnhancer } from './handlers/github-handler'
import { RedditHandler as RedditEnhancer } from './handlers/reddit-handler'

export interface EnhancedTextarea<T extends CommentSpot = CommentSpot> {
  element: HTMLTextAreaElement
  context: T
  handler: CommentEnhancer<T>
  overtype: OverType
}

export class EnhancerRegistry {
  private enhancers = new Set<CommentEnhancer<any>>()

  constructor() {
    // Register all available handlers
    this.register(new GitHubEnhancer())
    this.register(new RedditEnhancer())
  }

  private register<T extends CommentSpot>(handler: CommentEnhancer<T>): void {
    this.enhancers.add(handler)
  }

  getHandlerForType(type: string): CommentEnhancer<any> | null {
    for (const handler of this.enhancers) {
      if (handler.forCommentTypes().includes(type)) {
        return handler
      }
    }
    return null
  }

  identifyTextarea(textarea: HTMLTextAreaElement): EnhancedTextarea<any> | null {
    for (const handler of this.enhancers) {
      try {
        const result = handler.tryToEnhance(textarea)
        if (result) {
          const [overtype, context] = result
          return { context, element: textarea, handler, overtype }
        }
      } catch (error) {
        console.warn('Handler failed to identify textarea:', error)
      }
    }
    return null
  }

  getAllHandlers(): CommentEnhancer<any>[] {
    return Array.from(this.enhancers)
  }

  getCommentTypesForHandler(handler: CommentEnhancer<any>): string[] {
    return handler.forCommentTypes()
  }
}

export class TextareaRegistry {
  private textareas = new Map<HTMLTextAreaElement, EnhancedTextarea<any>>()

  register<T extends CommentSpot>(textareaInfo: EnhancedTextarea<T>): void {
    this.textareas.set(textareaInfo.element, textareaInfo)
    // TODO: register as a draft in progress with the global list
  }

  unregisterDueToModification(textarea: HTMLTextAreaElement): void {
    if (this.textareas.has(textarea)) {
      // TODO: register as abandoned or maybe submitted with the global list
      this.textareas.delete(textarea)
    }
  }

  get(textarea: HTMLTextAreaElement): EnhancedTextarea<any> | undefined {
    return this.textareas.get(textarea)
  }
}
