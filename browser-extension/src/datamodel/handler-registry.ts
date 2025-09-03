import { CommentType, CommentContext, TextareaHandler, TextareaInfo } from './textarea-handler';
import { GitHubHandler } from '../handlers/github-handler';
import { RedditHandler } from '../handlers/reddit-handler';

export class HandlerRegistry {
  private handlers = new Set<TextareaHandler<any>>();

  constructor() {
    // Register all available handlers
    this.register(new GitHubHandler());
    this.register(new RedditHandler());
  }

  private register<T extends CommentContext>(handler: TextareaHandler<T>): void {
    this.handlers.add(handler);
  }

  getHandlerForType(type: CommentType): TextareaHandler<any> | null {
    for (const handler of this.handlers) {
      if (handler.forCommentTypes().includes(type)) {
        return handler;
      }
    }
    return null;
  }

  identifyAll(): TextareaInfo<any>[] {
    const allTextareas: TextareaInfo<any>[] = [];
    
    for (const handler of this.handlers) {
      try {
        const textareas = handler.identify();
        allTextareas.push(...textareas);
      } catch (error) {
        console.warn('Handler failed to identify textareas:', error);
      }
    }
    
    return allTextareas;
  }

  getAllHandlers(): TextareaHandler<any>[] {
    return Array.from(this.handlers);
  }

  getCommentTypesForHandler(handler: TextareaHandler<any>): CommentType[] {
    return handler.forCommentTypes();
  }
}