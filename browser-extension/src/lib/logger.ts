import { CONFIG, type LogLevel } from './config'

/**
 * Simple logging utilities for the extension
 */

const prefix = `[${CONFIG.EXTENSION_NAME}]`

// No-op function for disabled logging
const noop = () => {}

// Log level hierarchy - index represents priority
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  DEBUG: 0,
  ERROR: 3,
  INFO: 1,
  WARN: 2,
}

// Helper function to check if a log level is enabled
const shouldLog = (level: LogLevel): boolean => {
  // Don't log anything in production mode
  if (CONFIG.MODE === 'PROD') {
    return false
  }
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[CONFIG.LOG_LEVEL]
}

// Export simple logging functions
export const logger = {
  debug: shouldLog('DEBUG') ? console.log.bind(console, prefix) : noop,
  error: shouldLog('ERROR') ? console.error.bind(console, prefix) : noop,
  info: shouldLog('INFO') ? console.log.bind(console, prefix) : noop,
  time: shouldLog('INFO') ? console.time.bind(console) : noop,
  timeEnd: shouldLog('INFO') ? console.timeEnd.bind(console) : noop,
  warn: shouldLog('WARN') ? console.warn.bind(console, prefix) : noop,
}
