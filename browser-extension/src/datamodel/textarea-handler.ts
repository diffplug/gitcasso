export type CommentType = 
  | 'GH_ISSUE_NEW'
  | 'GH_PR_NEW' 
  | 'GH_ISSUE_ADD_COMMENT'
  | 'GH_ISSUE_EDIT_COMMENT'
  | 'GH_PR_ADD_COMMENT'
  | 'GH_PR_EDIT_COMMENT'
  | 'GH_PR_CODE_COMMENT'
  | 'REDDIT_POST_NEW'
  | 'REDDIT_COMMENT_NEW'
  | 'REDDIT_COMMENT_EDIT'
  | 'GL_ISSUE_NEW'
  | 'GL_MR_NEW'
  | 'GL_ISSUE_ADD_COMMENT'
  | 'GL_MR_ADD_COMMENT'
  | 'BB_ISSUE_NEW'
  | 'BB_PR_NEW'
  | 'BB_ISSUE_ADD_COMMENT'
  | 'BB_PR_ADD_COMMENT';

export interface CommentContext {
  unique_key: string;
}

export interface TextareaInfo<T extends CommentContext = CommentContext> {
  element: HTMLTextAreaElement;
  type: CommentType;
  context: T;
}

export interface TextareaHandler<T extends CommentContext = CommentContext> {
  // Handler metadata
  forCommentTypes(): CommentType[];
  
  // Content script functionality
  identify(): TextareaInfo<T>[];
  readContent(textarea: HTMLTextAreaElement): string;
  setContent(textarea: HTMLTextAreaElement, content: string): void;
  onSubmit(textarea: HTMLTextAreaElement, callback: (success: boolean) => void): void;
  
  // Context extraction
  extractContext(textarea: HTMLTextAreaElement): T | null;
  determineType(textarea: HTMLTextAreaElement): CommentType | null;
  
  // Popup functionality helpers
  generateDisplayTitle(context: T): string;
  generateIcon(type: CommentType): string;
  buildUrl(context: T, withDraft?: boolean): string;
}

export abstract class BaseTextareaHandler<T extends CommentContext = CommentContext> implements TextareaHandler<T> {
  protected domain: string;
  
  constructor(domain: string) {
    this.domain = domain;
  }
  
  abstract forCommentTypes(): CommentType[];
  abstract identify(): TextareaInfo<T>[];
  abstract extractContext(textarea: HTMLTextAreaElement): T | null;
  abstract determineType(textarea: HTMLTextAreaElement): CommentType | null;
  abstract generateDisplayTitle(context: T): string;
  abstract generateIcon(type: CommentType): string;
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