const MODES = ['PROD', 'PLAYGROUNDS_PR'] as const

export type ModeType = (typeof MODES)[number]

const LOG_LEVELS = ['DEBUG', 'INFO', 'WARN', 'ERROR'] as const

export type LogLevel = (typeof LOG_LEVELS)[number]

export const CONFIG = {
  ADDED_OVERTYPE_CLASS: 'gitcasso-overtype',
  EXTENSION_NAME: 'gitcasso', // decorates logs
  LOG_LEVEL: 'DEBUG' satisfies LogLevel,
  MODE: 'PROD' satisfies ModeType,
} as const
