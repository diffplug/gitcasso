import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EnhancerRegistry, TextareaRegistry } from '../datamodel/registries'

// Mock WXT's defineContentScript global
vi.stubGlobal('defineContentScript', vi.fn())

describe('GitHub PR Content Script', () => {
  let enhancers: EnhancerRegistry
  let enhancedTextareas: TextareaRegistry
  let mockTextarea: HTMLTextAreaElement

  beforeEach(() => {
    // Reset DOM and registries for each test
    document.body.innerHTML = ''
    enhancers = new EnhancerRegistry()
    enhancedTextareas = new TextareaRegistry()

    // Mock window.location for GitHub PR page
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        hostname: 'github.com',
        pathname: '/diffplug/selfie/pull/517',
        href: 'https://github.com/diffplug/selfie/pull/517'
      }
    })

    // Create a mock textarea element that mimics GitHub's PR comment box
    mockTextarea = document.createElement('textarea')
    mockTextarea.name = 'comment[body]'
    mockTextarea.placeholder = 'Leave a comment'
    mockTextarea.className = 'form-control markdown-body'
    
    // Add it to a typical GitHub comment form structure
    const commentForm = document.createElement('div')
    commentForm.className = 'js-new-comment-form'
    commentForm.appendChild(mockTextarea)
    document.body.appendChild(commentForm)
  })

  it('should identify GitHub PR textarea and register it in TextareaRegistry', () => {
    // Simulate the content script's enhanceMaybe function
    const enhancedTextarea = enhancers.tryToEnhance(mockTextarea)
    
    expect(enhancedTextarea).toBeTruthy()
    expect(enhancedTextarea?.element).toBe(mockTextarea)
    expect(enhancedTextarea?.spot.type).toBe('GH_PR_ADD_COMMENT')
    
    // Register the enhanced textarea
    if (enhancedTextarea) {
      enhancedTextareas.register(enhancedTextarea)
    }
    
    // Verify it's in the registry
    const registeredTextarea = enhancedTextareas.get(mockTextarea)
    expect(registeredTextarea).toBeTruthy()
    expect(registeredTextarea?.element).toBe(mockTextarea)
  })

  it('should create correct GitHubContext spot for PR comment', () => {
    const enhancedTextarea = enhancers.tryToEnhance(mockTextarea)
    
    expect(enhancedTextarea).toBeTruthy()
    
    // Snapshot test on the spot value
    expect(enhancedTextarea?.spot).toMatchSnapshot('github-pr-517-spot')
    
    // Also verify specific expected values
    expect(enhancedTextarea?.spot).toMatchObject({
      type: 'GH_PR_ADD_COMMENT',
      domain: 'github.com',
      slug: 'diffplug/selfie',
      number: 517,
      unique_key: 'github:diffplug/selfie:pull:517',
      commentId: undefined
    })
  })

  it('should handle multiple textareas on the same page', () => {
    // Create a second textarea for inline code comments
    const codeCommentTextarea = document.createElement('textarea')
    codeCommentTextarea.className = 'form-control js-suggester-field'
    
    const inlineForm = document.createElement('div')
    inlineForm.className = 'js-inline-comment-form'
    inlineForm.appendChild(codeCommentTextarea)
    document.body.appendChild(inlineForm)

    // Test both textareas
    const mainCommentEnhanced = enhancers.tryToEnhance(mockTextarea)
    const codeCommentEnhanced = enhancers.tryToEnhance(codeCommentTextarea)

    expect(mainCommentEnhanced?.spot.type).toBe('GH_PR_ADD_COMMENT')
    expect(codeCommentEnhanced?.spot.type).toBe('GH_PR_CODE_COMMENT')
    
    // Register both
    if (mainCommentEnhanced) enhancedTextareas.register(mainCommentEnhanced)
    if (codeCommentEnhanced) enhancedTextareas.register(codeCommentEnhanced)

    // Verify both are registered
    expect(enhancedTextareas.get(mockTextarea)).toBeTruthy()
    expect(enhancedTextareas.get(codeCommentTextarea)).toBeTruthy()
  })

  it('should not enhance textarea on non-GitHub pages', () => {
    // Change location to non-GitHub site
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        hostname: 'example.com',
        pathname: '/some/page',
        href: 'https://example.com/some/page'
      }
    })

    const enhancedTextarea = enhancers.tryToEnhance(mockTextarea)
    expect(enhancedTextarea).toBeNull()
  })
})