import type { OverTypeInstance } from '../overtype/overtype'
import type { CommentEnhancer, CommentSpot } from './enhancer'
import { GitHubAddCommentEnhancer } from './enhancers/github/githubAddComment'

export interface EnhancedTextarea<T extends CommentSpot = CommentSpot> {
  textarea: HTMLTextAreaElement
  spot: T
  enhancer: CommentEnhancer<T>
  overtype: OverTypeInstance
}

export class EnhancerRegistry {
  private enhancers = new Set<CommentEnhancer>()
  private preparedEnhancers = new Set<CommentEnhancer>()

  constructor() {
    // Register all available handlers
    this.register(new GitHubAddCommentEnhancer())
  }

  private register<T extends CommentSpot>(handler: CommentEnhancer<T>): void {
    this.enhancers.add(handler)
  }

  tryToEnhance(textarea: HTMLTextAreaElement): EnhancedTextarea | null {
    for (const enhancer of this.enhancers) {
      try {
        const spot = enhancer.tryToEnhance(textarea)
        if (spot) {
          // Prepare enhancer on first use
          if (!this.preparedEnhancers.has(enhancer)) {
            enhancer.prepareForFirstEnhancement()
            this.preparedEnhancers.add(enhancer)
          }
          const overtype = enhancer.enhance(textarea, spot)
          return { enhancer, overtype, spot, textarea }
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
  private textareas = new Map<HTMLTextAreaElement, EnhancedTextarea>()

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

  get(textarea: HTMLTextAreaElement): EnhancedTextarea | undefined {
    return this.textareas.get(textarea)
  }
}
