import hljs from 'highlight.js'
import OverType from 'overtype'
import { oncePerRefresh } from '@/lib/once-per-refresh'

export function prepareGitHubHighlighter() {
  oncePerRefresh('github-highlighter', () => {
    OverType.setCodeHighlighter(githubHighlighter)
  })
}

function githubHighlighter(code: string, language?: string) {
  try {
    if (language && hljs.getLanguage(language)) {
      const result = hljs.highlight(code, { language })
      return result.value
    } else {
      const result = hljs.highlightAuto(code)
      return result.value
    }
  } catch (error) {
    console.warn('highlight.js highlighting failed:', error)
    return code
  }
}
