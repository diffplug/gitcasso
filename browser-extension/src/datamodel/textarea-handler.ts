
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
  
  // Content script functionality
  identify(): TextareaInfo<T>[];
  readContent(textarea: HTMLTextAreaElement): string;
  setContent(textarea: HTMLTextAreaElement, content: string): void;
  onSubmit(textarea: HTMLTextAreaElement, callback: (success: boolean) => void): void;
  
  // Context extraction
  extractContext(textarea: HTMLTextAreaElement): T | null;
  determineType(textarea: HTMLTextAreaElement): string | null;
  
  // Popup functionality helpers
  generateDisplayTitle(context: T): string;
  generateIcon(type: string): string;
  buildUrl(context: T, withDraft?: boolean): string;
}

export abstract class BaseTextareaHandler<T extends CommentContext = CommentContext> implements TextareaHandler<T> {
  protected domain: string;
  
  constructor(domain: string) {
    this.domain = domain;
  }
  
  abstract forCommentTypes(): string[];
  abstract identifyContextOf(textarea: HTMLTextAreaElement): TextareaInfo<T> | null;
  abstract identify(): TextareaInfo<T>[];
  abstract extractContext(textarea: HTMLTextAreaElement): T | null;
  abstract determineType(textarea: HTMLTextAreaElement): string | null;
  abstract generateDisplayTitle(context: T): string;
  abstract generateIcon(type: string): string;
  abstract buildUrl(context: T, withDraft?: boolean): string;
  
  readContent(textarea: HTMLTextAreaElement): string {
    return textarea.value;
  }
  
  setContent(textarea: HTMLTextAreaElement, content: string): void {
    textarea.value = content;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  onSubmit(textarea: HTMLTextAreaElement, callback: (success: boolean) => void): void {
    const form = textarea.closest('form');
    if (form) {
      form.addEventListener('submit', () => {
        setTimeout(() => callback(true), 100);
      }, { once: true });
    }
  }
}