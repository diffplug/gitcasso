import { OverType } from '../../overtype/mock-overtype'
import type { CommentEnhancer, CommentSpot } from '../enhancer'

export type RedditCommentType = 'REDDIT_POST_NEW' | 'REDDIT_COMMENT_NEW' | 'REDDIT_COMMENT_EDIT'

export interface RedditContext extends CommentSpot {
  type: RedditCommentType // Override to narrow from string to specific union
  subreddit: string
  postId?: string | undefined
  commentId?: string | undefined // for editing existing comments
}

export class RedditHandler implements CommentEnhancer<RedditContext> {
  forCommentTypes(): string[] {
    return ['REDDIT_POST_NEW', 'REDDIT_COMMENT_NEW', 'REDDIT_COMMENT_EDIT']
  }

  tryToEnhance(textarea: HTMLTextAreaElement): [OverType, RedditContext] | null {
    // Only handle Reddit domains
    if (!window.location.hostname.includes('reddit')) {
      return null
    }

    const pathname = window.location.pathname

    // Parse Reddit URL structure: /r/subreddit/comments/postid/title/
    const postMatch = pathname.match(/^\/r\/([^/]+)\/comments\/([^/]+)/)
    const submitMatch = pathname.match(/^\/r\/([^/]+)\/submit/)
    const subredditMatch = pathname.match(/^\/r\/([^/]+)/)

    let subreddit: string | undefined
    let postId: string | undefined

    if (postMatch) {
      ;[, subreddit, postId] = postMatch
    } else if (submitMatch) {
      ;[, subreddit] = submitMatch
    } else if (subredditMatch) {
      ;[, subreddit] = subredditMatch
    }

    if (!subreddit) {
      return null
    }

    // Check if editing existing comment
    const commentId = this.getCommentId(textarea)

    // Determine comment type
    let type: RedditCommentType

    // New post submission
    if (pathname.includes('/submit')) {
      type = 'REDDIT_POST_NEW'
    }
    // Check if we're on a post page
    else if (pathname.match(/\/r\/[^/]+\/comments\/[^/]+/)) {
      const isEditingComment = commentId !== null
      type = isEditingComment ? 'REDDIT_COMMENT_EDIT' : 'REDDIT_COMMENT_NEW'
    } else {
      return null
    }

    // Generate unique key
    let unique_key = `reddit:${subreddit}`
    if (postId) {
      unique_key += `:${postId}`
    } else {
      unique_key += ':new'
    }

    if (commentId) {
      unique_key += `:edit:${commentId}`
    }

    const context: RedditContext = {
      commentId: commentId || undefined,
      postId,
      subreddit,
      type,
      unique_key,
    }

    // Create OverType instance for this textarea
    const overtype = new OverType(textarea)

    return [overtype, context]
  }

  generateDisplayTitle(context: RedditContext): string {
    const { subreddit, postId, commentId } = context

    if (commentId) {
      return `Edit comment in r/${subreddit}`
    }

    if (postId) {
      return `Comment in r/${subreddit}`
    }

    return `New post in r/${subreddit}`
  }

  generateIcon(context: RedditContext): string {
    switch (context.type) {
      case 'REDDIT_POST_NEW':
        return '📝' // Post icon
      case 'REDDIT_COMMENT_NEW':
        return '💬' // Comment icon
      case 'REDDIT_COMMENT_EDIT':
        return '✏️' // Edit icon
      default:
        return '🔵' // Reddit icon
    }
  }

  buildUrl(context: RedditContext): string {
    const baseUrl = `https://reddit.com/r/${context.subreddit}`

    if (context.postId) {
      return `${baseUrl}/comments/${context.postId}/${context.commentId ? `#${context.commentId}` : ''}`
    }

    return baseUrl
  }

  private getCommentId(textarea: HTMLTextAreaElement): string | null {
    // Look for edit comment form indicators
    const commentForm = textarea.closest('[data-comment-id]')
    if (commentForm) {
      return commentForm.getAttribute('data-comment-id')
    }

    // Reddit uses different class names, check for common edit form patterns
    const editForm = textarea.closest('.edit-usertext') || textarea.closest('[data-type="comment"]')
    if (editForm) {
      const id = editForm.getAttribute('data-fullname') || editForm.getAttribute('data-comment-id')
      return id
    }

    return null
  }
}
