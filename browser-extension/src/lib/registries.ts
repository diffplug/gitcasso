import type { OverTypeInstance } from 'overtype'
import OverType from 'overtype'
import type { CommentEnhancer, CommentSpot } from './enhancer'
import { CommentEnhancerMissing } from './enhancers/CommentEnhancerMissing'
import { GitHubIssueAddCommentEnhancer } from './enhancers/github/githubIssueAddComment'
import { GitHubIssueNewCommentEnhancer } from './enhancers/github/githubIssueNewComment'
import { GitHubPRAddCommentEnhancer } from './enhancers/github/githubPRAddComment'
import { GitHubPRNewCommentEnhancer } from './enhancers/github/githubPRNewComment'

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
    this.register(new GitHubIssueNewCommentEnhancer())
    this.register(new GitHubPRAddCommentEnhancer())
    this.register(new GitHubPRNewCommentEnhancer())
    const textColor = 'rgb(31, 35, 40)'
    const headingColor = 'rgb(174, 52, 151)'
    OverType.setTheme({
      colors: {
        blockquote: 'rgb(89, 99, 110)',
        code: '#59636e',
        codeBg: '#f6f8fa',
        cursor: '#f95738',
        em: 'rgb(126, 123, 255)',
        h1: headingColor,
        h2: headingColor,
        h3: headingColor,
        hr: '#5a7a9b',
        link: 'rgb(9, 105, 218)',
        selection: 'rgba(244, 211, 94, 0.4)',
        strong: 'rgb(45, 1, 142)',
        syntaxMarker: textColor,
        text: textColor,
      },
      name: 'custom-github',
    })
  }

  private register<T extends CommentSpot>(enhancer: CommentEnhancer<T>): void {
    this.enhancers.add(enhancer)
    for (const spotType of enhancer.forSpotTypes()) {
      this.byType.set(spotType, enhancer)
    }
  }

  enhancerFor<T extends CommentSpot>(spot: T): CommentEnhancer<T> {
    return (this.byType.get(spot.type) || new CommentEnhancerMissing()) as CommentEnhancer<T>
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
          this.handleDelayedValueInjection(overtype)
          return { enhancer, overtype, spot, textarea }
        }
      } catch (error) {
        console.warn('Handler failed to identify textarea:', error)
      }
    }
    return null
  }

  private handleDelayedValueInjection(overtype: OverTypeInstance): void {
    // GitHub sometimes injects textarea content after a delay
    // We need to trigger OverType to update its preview after such injections
    // https://github.com/diffplug/gitcasso/issues/46
    setTimeout(() => {
      overtype.updatePreview()
    }, 100)
    setTimeout(() => {
      overtype.updatePreview()
    }, 200)
    setTimeout(() => {
      overtype.updatePreview()
    }, 400)
    setTimeout(() => {
      overtype.updatePreview()
    }, 8000)
  }

  getEnhancerCount(): number {
    return this.enhancers.size
  }
}

export class TextareaRegistry {
  private textareas = new Map<HTMLTextAreaElement, EnhancedTextarea>()
  private onEnhanced?: (spot: CommentSpot, textarea: HTMLTextAreaElement) => void
  private onDestroyed?: (spot: CommentSpot) => void

  setEventHandlers(
    onEnhanced: (spot: CommentSpot, textarea: HTMLTextAreaElement) => void,
    onDestroyed: (spot: CommentSpot) => void,
  ): void {
    this.onEnhanced = onEnhanced
    this.onDestroyed = onDestroyed
  }

  register<T extends CommentSpot>(textareaInfo: EnhancedTextarea<T>): void {
    this.textareas.set(textareaInfo.textarea, textareaInfo)
    this.onEnhanced?.(textareaInfo.spot, textareaInfo.textarea)
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
