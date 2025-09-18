export type CorpusType = 'har' | 'html'

export interface CorpusEntry {
  url: string
  type: CorpusType
  description?: string // Helpful for HTML corpus to describe the captured state
}

export const CORPUS: Record<string, CorpusEntry> = {
  // HAR corpus (initial page loads)
  gh_issue: {
    type: 'har',
    url: 'https://github.com/diffplug/selfie/issues/523',
  },
  gh_issue_populated_comment: {
    description: 'comment text box has some text',
    type: 'html',
    url: 'https://github.com/diffplug/selfie/issues/523',
  },
  gh_new_issue: {
    type: 'har',
    url: 'https://github.com/diffplug/selfie/issues/new',
  },
  gh_new_pr: {
    type: 'har',
    url: 'https://github.com/diffplug/selfie/compare/main...cavia-porcellus:selfie:main?expand=1',
  },
  gh_pr: {
    type: 'har',
    url: 'https://github.com/diffplug/selfie/pull/517',
  },
  // gh_issue_edit: {
  //   description: 'editing an existing comment on an issue',
  //   type: 'html',
  //   url: 'https://TODO'
  // },
  // gh_pr_edit: {
  //   description: 'editing an existing comment on a PR',
  //   type: 'html',
  //   url: 'https://TODO'
  // },
  gh_project: {
    description: 'github project board initial load',
    type: 'html',
    url: 'https://github.com/orgs/diffplug/projects/12',
  },
  gh_project_draft: {
    type: 'html',
    url: 'https://github.com/orgs/diffplug/projects/12/views/1?pane=issue&itemId=129503329',
  },
  gh_project_draft_edit: {
    description: 'editing an existing comment on a draft issue within a project',
    type: 'html',
    url: 'https://github.com/orgs/diffplug/projects/12/views/1?pane=issue&itemId=129503329',
  },
  gh_project_issue: {
    description: 'github project board issue add comment',
    type: 'html',
    url: 'https://github.com/orgs/diffplug/projects/12/views/1?pane=issue&itemId=129503239&issue=diffplug%7Cgitcasso%7C57',
  },
  gh_project_issue_edit: {
    description: 'editing an existing comment on a issue within a project',
    type: 'html',
    url: 'https://github.com/orgs/diffplug/projects/12/views/1?pane=issue&itemId=129503239&issue=diffplug%7Cgitcasso%7C57',
  },
} as const
