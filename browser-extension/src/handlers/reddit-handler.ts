import { CommentContext, BaseTextareaHandler, TextareaInfo } from '../datamodel/textarea-handler';

export type RedditCommentType = 
  | 'REDDIT_POST_NEW'
  | 'REDDIT_COMMENT_NEW'
  | 'REDDIT_COMMENT_EDIT';

export interface RedditContext extends CommentContext {
  subreddit: string;
  postId?: string | undefined;
  commentId?: string | undefined; // for editing existing comments
}

export class RedditHandler extends BaseTextareaHandler<RedditContext> {
  constructor() {
    super('reddit.com');
  }

  forCommentTypes(): string[] {
    return [
      'REDDIT_POST_NEW',
      'REDDIT_COMMENT_NEW',
      'REDDIT_COMMENT_EDIT'
    ];
  }

  identify(): TextareaInfo<RedditContext>[] {
    const textareas = document.querySelectorAll<HTMLTextAreaElement>('textarea');
    const results: TextareaInfo<RedditContext>[] = [];

    for (const textarea of textareas) {
      const type = this.determineType(textarea);
      const context = this.extractContext(textarea);
      
      if (type && context) {
        results.push({ element: textarea, type, context });
      }
    }

    return results;
  }

  extractContext(textarea: HTMLTextAreaElement): RedditContext | null {
    const pathname = window.location.pathname;
    
    // Parse Reddit URL structure: /r/subreddit/comments/postid/title/
    const postMatch = pathname.match(/^\/r\/([^\/]+)\/comments\/([^\/]+)/);
    const submitMatch = pathname.match(/^\/r\/([^\/]+)\/submit/);
    const subredditMatch = pathname.match(/^\/r\/([^\/]+)/);
    
    let subreddit: string | undefined;
    let postId: string | undefined;
    
    if (postMatch) {
      [, subreddit, postId] = postMatch;
    } else if (submitMatch) {
      [, subreddit] = submitMatch;
    } else if (subredditMatch) {
      [, subreddit] = subredditMatch;
    }
    
    if (!subreddit) {
      return null;
    }

    // Generate unique key
    let unique_key = `reddit:${subreddit}`;
    if (postId) {
      unique_key += `:${postId}`;
    } else {
      unique_key += ':new';
    }

    // Check if editing existing comment
    const commentId = this.getCommentId(textarea);
    if (commentId) {
      unique_key += `:edit:${commentId}`;
    }

    return {
      unique_key,
      subreddit,
      postId,
      commentId: commentId || undefined
    };
  }

  determineType(textarea: HTMLTextAreaElement): RedditCommentType | null {
    const pathname = window.location.pathname;
    
    // New post submission
    if (pathname.includes('/submit')) {
      return 'REDDIT_POST_NEW';
    }
    
    // Check if we're on a post page
    if (pathname.match(/\/r\/[^\/]+\/comments\/[^\/]+/)) {
      const isEditingComment = this.getCommentId(textarea) !== null;
      return isEditingComment ? 'REDDIT_COMMENT_EDIT' : 'REDDIT_COMMENT_NEW';
    }
    
    return null;
  }

  generateDisplayTitle(context: RedditContext): string {
    const { subreddit, postId, commentId } = context;
    
    if (commentId) {
      return `Edit comment in r/${subreddit}`;
    }
    
    if (postId) {
      return `Comment in r/${subreddit}`;
    }
    
    return `New post in r/${subreddit}`;
  }

  generateIcon(type: string): string {
    switch (type) {
      case 'REDDIT_POST_NEW':
        return '📝'; // Post icon
      case 'REDDIT_COMMENT_NEW':
        return '💬'; // Comment icon
      case 'REDDIT_COMMENT_EDIT':
        return '✏️'; // Edit icon
      default:
        return '🔵'; // Reddit icon
    }
  }

  buildUrl(context: RedditContext): string {
    const baseUrl = `https://reddit.com/r/${context.subreddit}`;
    
    if (context.postId) {
      return `${baseUrl}/comments/${context.postId}/${context.commentId ? `#${context.commentId}` : ''}`;
    }
    
    return baseUrl;
  }

  private getCommentId(textarea: HTMLTextAreaElement): string | null {
    // Look for edit comment form indicators
    const commentForm = textarea.closest('[data-comment-id]');
    if (commentForm) {
      return commentForm.getAttribute('data-comment-id');
    }
    
    // Reddit uses different class names, check for common edit form patterns
    const editForm = textarea.closest('.edit-usertext') || 
                    textarea.closest('[data-type="comment"]');
    if (editForm) {
      const id = editForm.getAttribute('data-fullname') || 
                editForm.getAttribute('data-comment-id');
      return id;
    }
    
    return null;
  }
}