import type { OverTypeInstance } from 'overtype'
import type { CommentEnhancer, CommentSpot } from './enhancer'
import { GitHubIssueAddCommentEnhancer } from './enhancers/github/githubIssueAddComment'
import { GitHubPRAddCommentEnhancer } from './enhancers/github/githubPRAddComment'

export interface EnhancedTextarea<T extends CommentSpot = CommentSpot> {
  textarea: HTMLTextAreaElement
  spot: T
  enhancer: CommentEnhancer<T>
  overtype: OverTypeInstance
}

export class EnhancerRegistry {
  private enhancers = new Set<CommentEnhancer>()
  private preparedEnhancers = new Set<CommentEnhancer>()
  byType = new Map<string, CommentEnhancer>()

  constructor() {
    // Register all available handlers
    this.register(new GitHubIssueAddCommentEnhancer())
    this.register(new GitHubPRAddCommentEnhancer())
  }

  private register<T extends CommentSpot>(enhancer: CommentEnhancer<T>): void {
    this.enhancers.add(enhancer)
    for (const spotType of enhancer.forSpotTypes()) {
      this.byType.set(spotType, enhancer)
    }
  }

  enhancerFor<T extends CommentSpot>(spot: T): CommentEnhancer<T> {
    return this.byType.get(spot.type)! as CommentEnhancer<T>
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
  private onEnhanced?: (spot: CommentSpot) => void
  private onDestroyed?: (spot: CommentSpot) => void

  setEventHandlers(
    onEnhanced: (spot: CommentSpot) => void,
    onDestroyed: (spot: CommentSpot) => void,
  ): void {
    this.onEnhanced = onEnhanced
    this.onDestroyed = onDestroyed
  }

  register<T extends CommentSpot>(textareaInfo: EnhancedTextarea<T>): void {
    this.textareas.set(textareaInfo.textarea, textareaInfo)
    this.onEnhanced?.(textareaInfo.spot)
  }

  unregisterDueToModification(textarea: HTMLTextAreaElement): void {
    const textareaInfo = this.textareas.get(textarea)
    if (textareaInfo) {
      this.onDestroyed?.(textareaInfo.spot)
      this.textareas.delete(textarea)
    }
  }

  get(textarea: HTMLTextAreaElement): EnhancedTextarea | undefined {
    return this.textareas.get(textarea)
  }
}
