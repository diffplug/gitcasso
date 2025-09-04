import { CommentContext, TextareaHandler, TextareaInfo } from '../datamodel/textarea-handler';

export type GitHubCommentType = 
  | 'GH_ISSUE_NEW'
  | 'GH_PR_NEW'
  | 'GH_ISSUE_ADD_COMMENT'
  | 'GH_ISSUE_EDIT_COMMENT'
  | 'GH_PR_ADD_COMMENT'
  | 'GH_PR_EDIT_COMMENT'
  | 'GH_PR_CODE_COMMENT';

export interface GitHubContext extends CommentContext {
  domain: string;
  slug: string; // owner/repo
  number?: number | undefined; // issue/PR number
  commentId?: string | undefined; // for editing existing comments
}

export class GitHubHandler implements TextareaHandler<GitHubContext> {

  forCommentTypes(): string[] {
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

  identifyContextOf(textarea: HTMLTextAreaElement): GitHubContext | null {
    // Only handle GitHub domains
    if (!window.location.hostname.includes('github')) {
      return null;
    }

    const pathname = window.location.pathname;
    
    // Parse GitHub URL structure: /owner/repo/issues/123 or /owner/repo/pull/456
    const match = pathname.match(/^\/([^\/]+)\/([^\/]+)(?:\/(issues|pull)\/(\d+))?/);
    if (!match) return null;

    const [, owner, repo, urlType, numberStr] = match;
    const slug = `${owner}/${repo}`;
    const number = numberStr ? parseInt(numberStr, 10) : undefined;
    
    // Check if editing existing comment
    const commentId = this.getCommentId(textarea);
    
    // Determine comment type
    let type: GitHubCommentType;
    
    // New issue
    if (pathname.includes('/issues/new')) {
      type = 'GH_ISSUE_NEW';
    }
    // New PR
    else if (pathname.includes('/compare/') || pathname.endsWith('/compare')) {
      type = 'GH_PR_NEW';
    }
    // Existing issue or PR page
    else if (urlType && number) {
      const isEditingComment = commentId !== null;
      
      if (urlType === 'issues') {
        type = isEditingComment ? 'GH_ISSUE_EDIT_COMMENT' : 'GH_ISSUE_ADD_COMMENT';
      } else {
        // Check if it's a code comment (in Files Changed tab)
        const isCodeComment = textarea.closest('.js-inline-comment-form') !== null ||
                             textarea.closest('[data-path]') !== null;
        
        if (isCodeComment) {
          type = 'GH_PR_CODE_COMMENT';
        } else {
          type = isEditingComment ? 'GH_PR_EDIT_COMMENT' : 'GH_PR_ADD_COMMENT';
        }
      }
    } else {
      return null;
    }
    
    // Generate unique key based on context
    let unique_key = `github:${slug}`;
    if (number) {
      unique_key += `:${urlType}:${number}`;
    } else {
      unique_key += ':new';
    }
    
    if (commentId) {
      unique_key += `:edit:${commentId}`;
    }

    const context: GitHubContext = {
      unique_key,
      type,
      domain: window.location.hostname,
      slug,
      number,
      commentId: commentId || undefined
    };

    return context;
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

  generateIcon(context: GitHubContext): string {
    switch (context.type) {
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

  buildUrl(context: GitHubContext): string {
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