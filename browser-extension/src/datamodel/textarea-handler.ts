
export interface CommentContext {
  unique_key: string;
}

export interface TextareaInfo<T extends CommentContext = CommentContext> {
  element: HTMLTextAreaElement;
  type: string;
  context: T;
}

export interface TextareaHandler<T extends CommentContext = CommentContext> {
  // Handler metadata
  forCommentTypes(): string[];
  // whenever a new `textarea` is added to any webpage, this method is called to try to find a handler for it
  identifyContextOf(textarea: HTMLTextAreaElement): TextareaInfo | null;
    
  // Context extraction
  extractContext(textarea: HTMLTextAreaElement): T | null;
  determineType(textarea: HTMLTextAreaElement): string | null;
  
  // Popup functionality helpers
  generateDisplayTitle(context: T): string;
  generateIcon(type: string): string;
  buildUrl(context: T, withDraft?: boolean): string;
}

