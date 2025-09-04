import { CONFIG } from './config'

/**
 * Simple logging utilities for the extension
 */

const prefix = `[${CONFIG.EXTENSION_NAME}]`

// No-op function for disabled logging
const noop = () => {}

// Export simple logging functions
export const logger = {
  debug: CONFIG.DEBUG ? console.log.bind(console, prefix) : noop,
  error: console.error.bind(console, prefix),
  info: CONFIG.DEBUG ? console.log.bind(console, prefix) : noop,
  time: CONFIG.DEBUG ? console.time.bind(console) : noop,
  timeEnd: CONFIG.DEBUG ? console.timeEnd.bind(console) : noop,
  warn: console.warn.bind(console, prefix),
}
