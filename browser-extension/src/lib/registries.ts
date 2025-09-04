import type { OverType } from '../overtype/mock-overtype'
import type { CommentEnhancer, CommentSpot } from './enhancer'
import { GitHubAddCommentEnhancer } from './enhancers/github'

export interface EnhancedTextarea<T extends CommentSpot = CommentSpot> {
  textarea: HTMLTextAreaElement
  spot: T
  handler: CommentEnhancer<T>
  overtype: OverType
}

export class EnhancerRegistry {
  private enhancers = new Set<CommentEnhancer<any>>()

  constructor() {
    // Register all available handlers
    this.register(new GitHubAddCommentEnhancer())
  }

  private register<T extends CommentSpot>(handler: CommentEnhancer<T>): void {
    this.enhancers.add(handler)
  }

  tryToEnhance(textarea: HTMLTextAreaElement): EnhancedTextarea<any> | null {
    for (const handler of this.enhancers) {
      try {
        const result = handler.tryToEnhance(textarea)
        if (result) {
          const [overtype, spot] = result
          return { handler, overtype, spot, textarea }
        }
      } catch (error) {
        console.warn('Handler failed to identify textarea:', error)
      }
    }
    return null
  }

  getEnhancerCount(): number {
    return this.enhancers.size
  }
}

export class TextareaRegistry {
  private textareas = new Map<HTMLTextAreaElement, EnhancedTextarea<any>>()

  register<T extends CommentSpot>(textareaInfo: EnhancedTextarea<T>): void {
    this.textareas.set(textareaInfo.textarea, textareaInfo)
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
