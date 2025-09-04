
export interface CommentContext {
  unique_key: string;
  type: string;
}

export interface TextareaInfo<T extends CommentContext = CommentContext> {
  element: HTMLTextAreaElement;
  context: T;
  handler: TextareaHandler<T>;
}

export interface TextareaHandler<T extends CommentContext = CommentContext> {
  // Handler metadata
  forCommentTypes(): string[];
  // whenever a new `textarea` is added to any webpage, this method is called to try to find a handler for it
  identifyContextOf(textarea: HTMLTextAreaElement): T | null;
  
  // Popup functionality helpers
  generateDisplayTitle(context: T): string;
  generateIcon(context: T): string;
  buildUrl(context: T, withDraft?: boolean): string;
}

