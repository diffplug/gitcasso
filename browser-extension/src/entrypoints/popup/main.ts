import './style.css'

document.addEventListener('DOMContentLoaded', async () => {
  const statusDiv = document.getElementById('scan-results') as HTMLElement

  try {
    // get current active tab
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    const tab = tabs[0]

    if (!tab?.id) {
      statusDiv.textContent = 'Cannot access current tab'
      return
    }

    // send message to content script to get scan results
    const results = await browser.tabs.sendMessage(tab.id, {
      action: 'getScanResults',
    })
    if (results) {
      // TODO: statusDiv.textContent = {{show drafts}}
    }
  } catch (error) {
    console.error('Popup error:', error)
    statusDiv.textContent = 'Unable to load saved drafts.'
  }
})
