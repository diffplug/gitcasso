import { HandlerRegistry } from '../datamodel/handler-registry'
import { TextareaRegistry } from '../datamodel/textarea-registry'
import { logger } from './content/logger'
import { injectStyles } from './content/styles'

const handlerRegistry = new HandlerRegistry()
const textareaRegistry = new TextareaRegistry()

export default defineContentScript({
  main() {
    const textAreasOnPageLoad = document.querySelectorAll<HTMLTextAreaElement>(`textarea`)
    for (const textarea of textAreasOnPageLoad) {
      initializeMaybeIsPageload(textarea)
    }
    const observer = new MutationObserver(handleMutations)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
    logger.debug('Extension loaded with', handlerRegistry.getAllHandlers().length, 'handlers')
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
          initializeMaybeIsPageload(element as HTMLTextAreaElement)
        } else {
          // Also check for textareas within added subtrees
          const textareas = element.querySelectorAll?.('textarea')
          if (textareas) {
            for (const textarea of textareas) {
              initializeMaybeIsPageload(textarea)
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
          textareaRegistry.unregisterDueToModification(element as HTMLTextAreaElement)
        } else {
          // Also check for textareas within removed subtrees
          const textareas = element.querySelectorAll?.('textarea')
          if (textareas) {
            for (const textarea of textareas) {
              textareaRegistry.unregisterDueToModification(textarea)
            }
          }
        }
      }
    }
  }
}

function initializeMaybeIsPageload(textarea: HTMLTextAreaElement) {
  // Check if this textarea is already registered
  if (textareaRegistry.get(textarea)) {
    logger.debug('textarea already registered {}', textarea)
    return
  }

  logger.debug('activating textarea {}', textarea)
  injectStyles()

  // Use registry to identify and handle this specific textarea
  const textareaInfo = handlerRegistry.identifyTextarea(textarea)
  if (textareaInfo) {
    logger.debug('Identified textarea:', textareaInfo.context.type, textareaInfo.context.unique_key)
    textareaRegistry.register(textareaInfo)
  } else {
    logger.debug('No handler found for textarea')
  }
}
