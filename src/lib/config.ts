const MODES = ["PROD"] as const

export type ModeType = (typeof MODES)[number]

const LOG_LEVELS = ["DEBUG", "INFO", "WARN", "ERROR"] as const

export type LogLevel = (typeof LOG_LEVELS)[number]

export const CONFIG = {
  EXTENSION_NAME: "gitcasso", // decorates logs
  LOG_LEVEL: (import.meta.env.MODE === "production"
    ? "WARN"
    : "DEBUG") satisfies LogLevel,
  MODE: "PROD" satisfies ModeType,
} as const
