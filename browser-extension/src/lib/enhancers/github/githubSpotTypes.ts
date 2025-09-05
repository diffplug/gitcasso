export const GITHUB_SPOT_TYPES = [
  'GH_PR_ADD_COMMENT',
  /* TODO
  'GH_ISSUE_NEW',
  'GH_PR_NEW',
  'GH_ISSUE_ADD_COMMENT',
  'GH_ISSUE_EDIT_COMMENT',
  'GH_PR_EDIT_COMMENT',
  'GH_PR_CODE_COMMENT',
  */
] as const

export type GitHubSpotType = (typeof GITHUB_SPOT_TYPES)[number]
