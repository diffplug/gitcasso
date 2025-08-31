import { CONFIG } from './content/config'
import { logger } from './content/logger'
import { injectStyles } from './content/styles'
import OverType from 'overtype'

export default defineContentScript({
  main() {
    const textAreasOnPageLoad = document.querySelectorAll<HTMLTextAreaElement>(`textarea`)
    for (const textarea of textAreasOnPageLoad) {
      initializeTextArea(textarea)
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
          initializeTextArea(element as HTMLTextAreaElement)
        }
      }
    }
  }
}

function initializeTextArea(textarea: HTMLTextAreaElement) {
  logger.debug('activating textarea {}', textarea)
  const overtype = new OverType(textarea)[0]
  logger.debug('overtype initialized {}', overtype)
  overtype.setValue('Testing 1, 2, 3')
}
