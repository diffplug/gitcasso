import { GitHubHandler } from '../handlers/github-handler'
import { RedditHandler } from '../handlers/reddit-handler'
import type { CommentContext, TextareaHandler, TextareaInfo } from './textarea-handler'

export class HandlerRegistry {
  private handlers = new Set<TextareaHandler<any>>()

  constructor() {
    // Register all available handlers
    this.register(new GitHubHandler())
    this.register(new RedditHandler())
  }

  private register<T extends CommentContext>(handler: TextareaHandler<T>): void {
    this.handlers.add(handler)
  }

  getHandlerForType(type: string): TextareaHandler<any> | null {
    for (const handler of this.handlers) {
      if (handler.forCommentTypes().includes(type)) {
        return handler
      }
    }
    return null
  }

  identifyTextarea(textarea: HTMLTextAreaElement): TextareaInfo<any> | null {
    for (const handler of this.handlers) {
      try {
        const context = handler.identifyContextOf(textarea)
        if (context) {
          return { context, element: textarea, handler }
        }
      } catch (error) {
        console.warn('Handler failed to identify textarea:', error)
      }
    }
    return null
  }

  getAllHandlers(): TextareaHandler<any>[] {
    return Array.from(this.handlers)
  }

  getCommentTypesForHandler(handler: TextareaHandler<any>): string[] {
    return handler.forCommentTypes()
  }
}
