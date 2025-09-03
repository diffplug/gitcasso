import { CONFIG } from './content/config'
import { logger } from './content/logger'
import { injectStyles } from './content/styles'
import { HandlerRegistry } from '../datamodel/handler-registry'

const registry = new HandlerRegistry()

export default defineContentScript({
  main() {
    const textAreasOnPageLoad = document.querySelectorAll<HTMLTextAreaElement>(`textarea`)
    for (const textarea of textAreasOnPageLoad) {
      initializeMaybe(textarea)
    }
    const observer = new MutationObserver(handleMutations)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
    logger.debug('Extension loaded with', registry.getAllHandlers().length, 'handlers')
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
          initializeMaybe(element as HTMLTextAreaElement)
        }
        // Also check for textareas within added subtrees
        const textareas = element.querySelectorAll?.('textarea')
        if (textareas) {
          for (const textarea of textareas) {
            initializeMaybe(textarea)
          }
        }
      }
    }
  }
}

function initializeMaybe(textarea: HTMLTextAreaElement) {
  if (!textarea.classList.contains(CONFIG.ADDED_OVERTYPE_CLASS)) {
    logger.debug('activating textarea {}', textarea)
    injectStyles()
    textarea.classList.add(CONFIG.ADDED_OVERTYPE_CLASS)
    
    // Use registry to identify and handle this specific textarea
    const textareaInfo = registry.identifyTextarea(textarea)
    if (textareaInfo) {
      logger.debug('Identified textarea:', textareaInfo.type, textareaInfo.context.unique_key)
      // TODO: Set up textarea monitoring and draft saving
    } else {
      logger.debug('No handler found for textarea')
    }
  } else {
    logger.debug('already activated textarea {}', textarea)
  }
}
