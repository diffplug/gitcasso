import { CONFIG } from '../common/config'
import { logger } from '../common/logger'
import { EnhancerRegistry, TextareaRegistry } from '../datamodel/registries'

const enhancers = new EnhancerRegistry()
const enhancedTextareas = new TextareaRegistry()

export default defineContentScript({
  main() {
    const textAreasOnPageLoad = document.querySelectorAll<HTMLTextAreaElement>(`textarea`)
    for (const textarea of textAreasOnPageLoad) {
      enhanceMaybe(textarea)
    }
    const observer = new MutationObserver(handleMutations)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
    logger.debug('Extension loaded with', enhancers.getAllHandlers().length, 'handlers')
  },
  matches: ['<all_urls>'],
  runAt: 'document_end',
})

function handleMutations(mutations: MutationRecord[]): void {
  for (const mutation of mutations) {
    // Handle added nodes
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

    // Handle removed nodes
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
  // Check if this textarea is already registered
  if (enhancedTextareas.get(textarea)) {
    logger.debug('textarea already registered {}', textarea)
    return
  }

  logger.debug('activating textarea {}', textarea)
  injectStyles()

  // Use registry to identify and handle this specific textarea
  const enhancedTextarea = enhancers.identifyTextarea(textarea)
  if (enhancedTextarea) {
    logger.debug(
      'Identified textarea:',
      enhancedTextarea.context.type,
      enhancedTextarea.context.unique_key,
    )
    enhancedTextareas.register(enhancedTextarea)
  } else {
    logger.debug('No handler found for textarea')
  }
}

const STYLES = `
.${CONFIG.ADDED_OVERTYPE_CLASS} {
  background: cyan !important;
}
`

function injectStyles(): void {
  if (!document.getElementById('gitcasso-styles')) {
    const style = document.createElement('style')
    style.textContent = STYLES
    style.id = 'gitcasso-styles'
    document.head.appendChild(style)
  }
}
