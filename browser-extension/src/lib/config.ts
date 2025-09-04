const MODES = ['PROD', 'PLAYGROUNDS_PR'] as const

export type ModeType = (typeof MODES)[number]

export const CONFIG = {
  ADDED_OVERTYPE_CLASS: 'gitcasso-overtype',
  DEBUG: true, // enabled debug logging
  EXTENSION_NAME: 'gitcasso', // decorates logs
  MODE: 'PLAYGROUNDS_PR' satisfies ModeType,
} as const
