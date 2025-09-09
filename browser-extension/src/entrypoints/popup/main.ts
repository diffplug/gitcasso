import './style.css'
import type { CommentState } from '../background'
import { EnhancerRegistry } from '../../lib/registries'
import { logger } from '../../lib/logger'

// Test basic DOM access
try {
  const app = document.getElementById('app')
  logger.debug('Found app element:', app)
  if (app) {
    app.innerHTML = '<div>Script is running...</div>'
  }
} catch (error) {
  logger.error('Error accessing DOM:', error)
}

const enhancers = new EnhancerRegistry()

async function getOpenSpots(): Promise<CommentState[]> {
  logger.debug('Sending message to background script...')
  try {
    const response = await browser.runtime.sendMessage({ type: 'GET_OPEN_SPOTS' })
    logger.debug('Received response:', response)
    return response.spots || []
  } catch (error) {
    logger.error('Error sending message to background:', error)
    return []
  }
}

async function switchToTab(tabId: number, windowId: number): Promise<void> {
  await browser.windows.update(windowId, { focused: true })
  await browser.tabs.update(tabId, { active: true })
  window.close()
}

function createSpotElement(commentState: CommentState): HTMLElement {
  const item = document.createElement('div')
  item.className = 'spot-item'

  logger.debug('Creating spot element for:', commentState.spot)
  const enhancer = enhancers.enhancerFor(commentState.spot)
  logger.debug('Found enhancer:', enhancer)

  const title = document.createElement('div')
  title.className = 'spot-title'

  if (enhancer) {
    title.textContent = enhancer.tableTitle(commentState.spot)
  } else {
    title.textContent = `${commentState.spot.type} (${commentState.spot.unique_key})`
  }

  item.appendChild(title)

  item.addEventListener('click', () => {
    switchToTab(commentState.tab.tabId, commentState.tab.windowId)
  })

  return item
}

async function renderOpenSpots(): Promise<void> {
  logger.debug('renderOpenSpots called')
  const app = document.getElementById('app')!
  const spots = await getOpenSpots()
  logger.debug('Got spots:', spots)

  if (spots.length === 0) {
    app.innerHTML = '<div class="no-spots">No open comment spots</div>'
    return
  }

  const header = document.createElement('h2')
  header.textContent = 'Open Comment Spots'
  app.appendChild(header)

  const list = document.createElement('div')
  list.className = 'spots-list'

  spots.forEach(spot => {
    list.appendChild(createSpotElement(spot))
  })

  app.appendChild(list)
}

renderOpenSpots().catch(error => {
  logger.error('Error in renderOpenSpots:', error)
  const app = document.getElementById('app')!
  app.innerHTML = `<div class="no-spots">Error loading spots: ${error.message}</div>`
})
