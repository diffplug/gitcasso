import type { CommentEvent, StrippedLocation } from '../lib/enhancer'
import { logger } from '../lib/logger'
import { EnhancerRegistry, TextareaRegistry } from '../lib/registries'

const enhancers = new EnhancerRegistry()
const enhancedTextareas = new TextareaRegistry()

// Expose for debugging in har:view
;(window as any).gitcassoTextareaRegistry = enhancedTextareas

function detectLocation(): StrippedLocation {
  if ((window as any).gitcassoMockLocation) {
    return (window as any).gitcassoMockLocation
  }
  const result = {
    host: window.location.host,
    pathname: window.location.pathname,
  }
  logger.debug('[gitcasso] detectLocation called, returning:', result)
  return result
}

function sendEventToBackground(message: CommentEvent): void {
  browser.runtime.sendMessage(message).catch((error) => {
    logger.error('Failed to send event to background:', error)
  })
}

enhancedTextareas.setCommentEventSender(sendEventToBackground)

export default defineContentScript({
  main() {
    logger.debug('Main was called')
    const textAreasOnPageLoad = document.querySelectorAll<HTMLTextAreaElement>(`textarea`)
    for (const textarea of textAreasOnPageLoad) {
      enhanceMaybe(textarea)
    }
    const observer = new MutationObserver(handleMutations)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    // Listen for tab visibility changes to capture draft content when switching tabs
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        enhancedTextareas.tabLostFocus()
      }
    })

    logger.debug('Extension loaded with', enhancers.getEnhancerCount(), 'handlers')
  },
  matches: ['<all_urls>'],
  runAt: 'document_end',
})

function handleMutations(mutations: MutationRecord[]): void {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element
        if (element.tagName === 'TEXTAREA') {
          enhanceMaybe(element as HTMLTextAreaElement)
        } else {
          // Also check for textareas within added subtrees
          const textareas = element.querySelectorAll?.('textarea')
          if (textareas) {
            for (const textarea of textareas) {
              enhanceMaybe(textarea)
            }
          }
        }
      }
    }

    for (const node of mutation.removedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element
        if (element.tagName === 'TEXTAREA') {
          enhancedTextareas.unregisterDueToModification(element as HTMLTextAreaElement)
        } else {
          // Also check for textareas within removed subtrees
          const textareas = element.querySelectorAll?.('textarea')
          if (textareas) {
            for (const textarea of textareas) {
              enhancedTextareas.unregisterDueToModification(textarea)
            }
          }
        }
      }
    }
  }
}

function enhanceMaybe(textarea: HTMLTextAreaElement) {
  logger.debug('[gitcasso] enhanceMaybe called for textarea:', textarea.id, textarea.className)
  if (enhancedTextareas.get(textarea)) {
    logger.debug('textarea already registered {}', textarea)
    return
  }
  try {
    const location = detectLocation()
    logger.debug('[gitcasso] Calling tryToEnhance with location:', location)
    const enhancedTextarea = enhancers.tryToEnhance(textarea, location)
    if (enhancedTextarea) {
      logger.debug(
        'Identified textarea:',
        enhancedTextarea.spot.type,
        enhancedTextarea.spot.unique_key,
      )
      enhancedTextareas.register(enhancedTextarea)
    } else {
      logger.debug('No handler found for textarea')
    }
  } catch (e) {
    logger.error(e)
  }
}
