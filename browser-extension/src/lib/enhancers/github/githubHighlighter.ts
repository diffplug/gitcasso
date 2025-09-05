import hljs from 'highlight.js'

export function githubHighlighter(code: string, language: string) {
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
