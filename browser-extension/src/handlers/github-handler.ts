import { CommentType, CommentContext, BaseTextareaHandler, TextareaInfo } from '../datamodel/textarea-handler';

export interface GitHubContext extends CommentContext {
  domain: string;
  slug: string; // owner/repo
  number?: number; // issue/PR number
  commentId?: string; // for editing existing comments
}

export class GitHubHandler extends BaseTextareaHandler<GitHubContext> {
  constructor() {
    super('github.com');
  }

  forCommentTypes(): CommentType[] {
    return [
      'GH_ISSUE_NEW',
      'GH_PR_NEW',
      'GH_ISSUE_ADD_COMMENT',
      'GH_ISSUE_EDIT_COMMENT',
      'GH_PR_ADD_COMMENT',
      'GH_PR_EDIT_COMMENT',
      'GH_PR_CODE_COMMENT'
    ];
  }

  identify(): TextareaInfo<GitHubContext>[] {
    const textareas = document.querySelectorAll<HTMLTextAreaElement>('textarea');
    const results: TextareaInfo<GitHubContext>[] = [];

    for (const textarea of textareas) {
      const type = this.determineType(textarea);
      const context = this.extractContext(textarea);
      
      if (type && context) {
        results.push({ element: textarea, type, context });
      }
    }

    return results;
  }

  extractContext(textarea: HTMLTextAreaElement): GitHubContext | null {
    const url = window.location.href;
    const pathname = window.location.pathname;
    
    // Parse GitHub URL structure: /owner/repo/issues/123 or /owner/repo/pull/456
    const match = pathname.match(/^\/([^\/]+)\/([^\/]+)(?:\/(issues|pull)\/(\d+))?/);
    if (!match) return null;

    const [, owner, repo, type, numberStr] = match;
    const slug = `${owner}/${repo}`;
    const number = numberStr ? parseInt(numberStr, 10) : undefined;
    
    // Generate unique key based on context
    let unique_key = `github:${slug}`;
    if (number) {
      unique_key += `:${type}:${number}`;
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
      domain: window.location.hostname,
      slug,
      number,
      commentId
    };
  }

  determineType(textarea: HTMLTextAreaElement): CommentType | null {
    const pathname = window.location.pathname;
    
    // New issue
    if (pathname.includes('/issues/new')) {
      return 'GH_ISSUE_NEW';
    }
    
    // New PR
    if (pathname.includes('/compare/') || pathname.endsWith('/compare')) {
      return 'GH_PR_NEW';
    }
    
    // Check if we're on an issue or PR page
    const match = pathname.match(/\/(issues|pull)\/(\d+)/);
    if (!match) return null;
    
    const [, type] = match;
    const isEditingComment = this.getCommentId(textarea) !== null;
    
    if (type === 'issues') {
      return isEditingComment ? 'GH_ISSUE_EDIT_COMMENT' : 'GH_ISSUE_ADD_COMMENT';
    } else {
      // Check if it's a code comment (in Files Changed tab)
      const isCodeComment = textarea.closest('.js-inline-comment-form') !== null ||
                           textarea.closest('[data-path]') !== null;
      
      if (isCodeComment) {
        return 'GH_PR_CODE_COMMENT';
      }
      
      return isEditingComment ? 'GH_PR_EDIT_COMMENT' : 'GH_PR_ADD_COMMENT';
    }
  }

  generateDisplayTitle(context: GitHubContext): string {
    const { slug, number, commentId } = context;
    
    if (commentId) {
      return `Edit comment in ${slug}${number ? ` #${number}` : ''}`;
    }
    
    if (number) {
      return `Comment on ${slug} #${number}`;
    }
    
    return `New ${window.location.pathname.includes('/issues/') ? 'issue' : 'PR'} in ${slug}`;
  }

  generateIcon(type: CommentType): string {
    switch (type) {
      case 'GH_ISSUE_NEW':
      case 'GH_ISSUE_ADD_COMMENT':
      case 'GH_ISSUE_EDIT_COMMENT':
        return '🐛'; // Issue icon
      case 'GH_PR_NEW':
      case 'GH_PR_ADD_COMMENT':
      case 'GH_PR_EDIT_COMMENT':
        return '🔄'; // PR icon
      case 'GH_PR_CODE_COMMENT':
        return '💬'; // Code comment icon
      default:
        return '📝'; // Generic comment icon
    }
  }

  buildUrl(context: GitHubContext, withDraft?: boolean): string {
    const baseUrl = `https://${context.domain}/${context.slug}`;
    
    if (context.number) {
      const type = window.location.pathname.includes('/issues/') ? 'issues' : 'pull';
      return `${baseUrl}/${type}/${context.number}${context.commentId ? `#issuecomment-${context.commentId}` : ''}`;
    }
    
    return baseUrl;
  }

  private getCommentId(textarea: HTMLTextAreaElement): string | null {
    // Look for edit comment form indicators
    const commentForm = textarea.closest('[data-comment-id]');
    if (commentForm) {
      return commentForm.getAttribute('data-comment-id');
    }
    
    const editForm = textarea.closest('.js-comment-edit-form');
    if (editForm) {
      const commentContainer = editForm.closest('.js-comment-container');
      if (commentContainer) {
        const id = commentContainer.getAttribute('data-gid') || 
                  commentContainer.getAttribute('id');
        return id ? id.replace('issuecomment-', '') : null;
      }
    }
    
    return null;
  }
}