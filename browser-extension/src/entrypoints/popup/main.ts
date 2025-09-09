import './style.css'
import type { CommentState } from '../background'
import { EnhancerRegistry } from '../../lib/registries'

const enhancers = new EnhancerRegistry()

async function getOpenSpots(): Promise<CommentState[]> {
  return new Promise((resolve) => {
    browser.runtime.sendMessage({ type: 'GET_OPEN_SPOTS' }, (response) => {
      resolve(response.spots || [])
    })
  })
}

async function switchToTab(tabId: number, windowId: number): Promise<void> {
  await browser.windows.update(windowId, { focused: true })
  await browser.tabs.update(tabId, { active: true })
  window.close()
}

function createSpotElement(commentState: CommentState): HTMLElement {
  const item = document.createElement('div')
  item.className = 'spot-item'

  const title = document.createElement('div')
  title.className = 'spot-title'

  const enhancer = enhancers.enhancerFor(commentState.spot)
  title.textContent = enhancer.tableTitle(commentState.spot)

  item.appendChild(title)

  item.addEventListener('click', () => {
    switchToTab(commentState.tab.tabId, commentState.tab.windowId)
  })

  return item
}

async function renderOpenSpots(): Promise<void> {
  const app = document.getElementById('app')!
  const spots = await getOpenSpots()

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

renderOpenSpots()
