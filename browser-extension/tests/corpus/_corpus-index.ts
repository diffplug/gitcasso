export type CorpusType = 'har' | 'html'

export interface CorpusEntry {
  url: string
  type: CorpusType
  description?: string // Helpful for HTML corpus to describe the captured state
}

export const CORPUS: Record<string, CorpusEntry> = {
  // HAR corpus (initial page loads)
  gh_issue: {
    url: 'https://github.com/diffplug/selfie/issues/523',
    type: 'har'
  },
  gh_new_issue: {
    url: 'https://github.com/diffplug/selfie/issues/new',
    type: 'har'
  },
  gh_new_pr: {
    url: 'https://github.com/diffplug/selfie/compare/main...cavia-porcellus:selfie:main?expand=1',
    type: 'har'
  },
  gh_pr: {
    url: 'https://github.com/diffplug/selfie/pull/517',
    type: 'har'
  },
  // HTML corpus (captured after user interactions via SingleFile)
  // Add new entries here as needed, e.g.:
  // gh_issue_with_comment_preview: {
  //   url: 'https://github.com/diffplug/selfie/issues/523',
  //   type: 'html',
  //   description: 'Issue page with comment textarea expanded and preview tab active'
  // }
} as const