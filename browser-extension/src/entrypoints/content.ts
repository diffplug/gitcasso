import { CONFIG } from './content/config'
import { logger } from './content/logger'
import { injectStyles } from './content/styles'

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
    logger.debug('Extension loaded')
  },
  matches: ['<all_urls>'],
  runAt: 'document_end',
})

function handleMutations(mutations: MutationRecord[]): void {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element
        if (element.tagName === 'textarea') {
          initializeMaybe(element as HTMLTextAreaElement)
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
  } else {
    logger.debug('already activated textarea {}', textarea)
  }
}
