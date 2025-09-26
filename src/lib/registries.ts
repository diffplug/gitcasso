import type { OverTypeInstance } from 'overtype'
import OverType from 'overtype'
import type {
  CommentEnhancer,
  CommentEvent,
  CommentEventType,
  CommentSpot,
  StrippedLocation,
} from './enhancer'
import { CommentEnhancerMissing } from './enhancers/CommentEnhancerMissing'
import { GitHubEditEnhancer } from './enhancers/github/GitHubEditEnhancer'
import { GitHubIssueAppendEnhancer } from './enhancers/github/GitHubIssueAppendEnhancer'
import { GitHubIssueCreateEnhancer } from './enhancers/github/GitHubIssueCreateEnhancer'
import { GitHubPrAppendEnhancer } from './enhancers/github/GitHubPrAppendEnhancer'
import { GitHubPrCreateEnhancer } from './enhancers/github/GitHubPrCreateEnhancer'

export interface EnhancedTextarea<T extends CommentSpot = CommentSpot> {
  textarea: HTMLTextAreaElement
  spot: T
  enhancer: CommentEnhancer<T>
  overtype: OverTypeInstance
  cleanup?: () => void
}

export class EnhancerRegistry {
  private enhancers = new Set<CommentEnhancer>()
  byType = new Map<string, CommentEnhancer>()

  constructor() {
    // Register all available handlers
    this.register(new GitHubEditEnhancer())
    this.register(new GitHubIssueAppendEnhancer())
    this.register(new GitHubIssueCreateEnhancer())
    this.register(new GitHubPrAppendEnhancer())
    this.register(new GitHubPrCreateEnhancer())
    const textColor = 'rgb(31, 35, 40)'
    const headingColor = 'rgb(174, 52, 151)'
    OverType.setTheme({
      colors: {
        blockquote: 'rgb(89, 99, 110)',
        code: '#59636e',
        codeBg: '#f6f8fa',
        cursor: '#000000',
        em: 'rgb(126, 123, 255)',
        h1: headingColor,
        h2: headingColor,
        h3: headingColor,
        hr: '#5a7a9b',
        link: 'rgb(9, 105, 218)',
        selection: 'rgba(0, 123, 255, 0.3)',
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

  tryToEnhance(textarea: HTMLTextAreaElement, location: StrippedLocation): EnhancedTextarea | null {
    for (const enhancer of this.enhancers) {
      try {
        const spot = enhancer.tryToEnhance(textarea, location)
        if (spot) {
          const { instance: overtype, cleanup } = enhancer.enhance(textarea, spot)
          this.handleDelayedValueInjection(overtype)
          return { enhancer, overtype, spot, textarea, ...(cleanup && { cleanup }) }
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
    }, 800)
  }

  getEnhancerCount(): number {
    return this.enhancers.size
  }
}

export class TextareaRegistry {
  private textareas = new Map<HTMLTextAreaElement, EnhancedTextarea>()
  private eventSender: (event: CommentEvent) => void = () => {}

  setCommentEventSender(sendEvent: (event: CommentEvent) => void): void {
    this.eventSender = sendEvent
  }

  private sendEvent(eventType: CommentEventType, enhanced: EnhancedTextarea): void {
    this.eventSender({
      draft: enhanced.textarea.value,
      spot: enhanced.spot,
      type: eventType,
    })
  }

  register<T extends CommentSpot>(enhanced: EnhancedTextarea<T>): void {
    this.textareas.set(enhanced.textarea, enhanced)
    enhanced.textarea.addEventListener('blur', () => {
      this.sendEvent('LOST_FOCUS', enhanced)
    })
    this.sendEvent('ENHANCED', enhanced)
  }

  unregisterDueToModification(textarea: HTMLTextAreaElement): void {
    const enhanced = this.textareas.get(textarea)
    if (enhanced) {
      if (enhanced.cleanup) {
        enhanced.cleanup()
      }
      this.sendEvent('DESTROYED', enhanced)
      this.textareas.delete(textarea)
    }
  }

  get(textarea: HTMLTextAreaElement): EnhancedTextarea | undefined {
    return this.textareas.get(textarea)
  }

  tabLostFocus(): void {
    for (const enhanced of this.textareas.values()) {
      this.sendEvent('LOST_FOCUS', enhanced)
    }
  }
}
