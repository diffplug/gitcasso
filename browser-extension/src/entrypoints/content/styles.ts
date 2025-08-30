import { CONFIG } from './config'

const STYLES = `
.${CONFIG.ADDED_OVERTYPE_CLASS} {
  background: cyan !important;
}
`

export function injectStyles(): void {
  if (!document.getElementById('gitcasso-styles')) {
    const style = document.createElement('style')
    style.textContent = STYLES
    style.id = 'gitcasso-styles'
    document.head.appendChild(style)
  }
}
