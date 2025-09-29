export type CorpusType = "har" | "html"

export interface CorpusEntry {
  url: string
  type: CorpusType
  description?: string // Helpful for HTML corpus to describe the captured state
}

export const CORPUS: Record<string, CorpusEntry> = {
  gh_issue: {
    description: "comment text box has some text",
    type: "html",
    url: "https://github.com/diffplug/selfie/issues/523",
  },
  // HAR corpus (initial page loads)
  gh_issue_edit: {
    description: "edit an existing comment on an issue",
    type: "html",
    url: "https://github.com/diffplug/gitcasso/issues/56",
  },
  gh_issue_edit_multiple: {
    description: "edit an existing comment on an issue (root and appended)",
    type: "html",
    url: "https://github.com/diffplug/testing-deletable/issues/3",
  },
  gh_issue_new: {
    description: "a new issue wiht some fields filled out",
    type: "html",
    url: "https://github.com/diffplug/gitcasso/issues/new",
  },
  gh_pr: {
    type: "har",
    url: "https://github.com/diffplug/selfie/pull/517",
  },
  gh_pr_edit: {
    description: "edit an existing comment on a PR",
    type: "html",
    url: "https://github.com/diffplug/gitcasso/pull/58",
  },
  gh_pr_edit_multiple: {
    description: "edit an existing comment on a PR  (root and appended)",
    type: "html",
    url: "https://github.com/diffplug/testing-deletable/pull/5",
  },
  gh_pr_new: {
    type: "har",
    url: "https://github.com/diffplug/selfie/compare/main...cavia-porcellus:selfie:main?expand=1",
  },
  gh_project: {
    description: "github project board initial load",
    type: "html",
    url: "https://github.com/orgs/diffplug/projects/12",
  },
  gh_project_draft: {
    type: "html",
    url: "https://github.com/orgs/diffplug/projects/12/views/1?pane=issue&itemId=129503329",
  },
  gh_project_draft_edit: {
    description:
      "editing an existing comment on a draft issue within a project",
    type: "html",
    url: "https://github.com/orgs/diffplug/projects/12/views/1?pane=issue&itemId=129503329",
  },
  gh_project_issue: {
    description: "github project board issue add comment",
    type: "html",
    url: "https://github.com/orgs/diffplug/projects/12/views/1?pane=issue&itemId=129503239&issue=diffplug%7Cgitcasso%7C57",
  },
  gh_project_issue_edit: {
    description: "editing an existing comment on a issue within a project",
    type: "html",
    url: "https://github.com/orgs/diffplug/projects/12/views/1?pane=issue&itemId=129503239&issue=diffplug%7Cgitcasso%7C57",
  },
} as const
