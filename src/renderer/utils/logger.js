// src/renderer/utils/logger.js
// Logger utility for structured console logging with context and environment awareness

export class Logger {
  constructor(context = 'App') {
    this.context = context;
    this.isDev = process.env.NODE_ENV === 'development';
  }

  /**
   * Log informational message (development only)
   * @param {string} message - Log message
   * @param {...any} args - Additional arguments to log
   */
  info(message, ...args) {
    if (this.isDev) {
      console.log(`[${this.context}] INFO: ${message}`, ...args);
    }
  }

  /**
   * Log warning message (all environments)
   * @param {string} message - Warning message
   * @param {...any} args - Additional arguments to log
   */
  warn(message, ...args) {
    console.warn(`[${this.context}] WARN: ${message}`, ...args);
  }

  /**
   * Log error message (all environments)
   * @param {string} message - Error message
   * @param {...any} args - Additional arguments to log
   */
  error(message, ...args) {
    console.error(`[${this.context}] ERROR: ${message}`, ...args);
  }

  /**
   * Log debug message (development only)
   * @param {string} message - Debug message
   * @param {...any} args - Additional arguments to log
   */
  debug(message, ...args) {
    if (this.isDev) {
      console.debug(`[${this.context}] DEBUG: ${message}`, ...args);
    }
  }

  /**
   * Log message with specified level
   * @param {string} level - Log level (info, warn, error, debug)
   * @param {string} message - Log message
   * @param {...any} args - Additional arguments to log
   */
  log(level, message, ...args) {
    switch (level) {
      case 'info':
        this.info(message, ...args);
        break;
      case 'warn':
        this.warn(message, ...args);
        break;
      case 'error':
        this.error(message, ...args);
        break;
      case 'debug':
        this.debug(message, ...args);
        break;
      default:
        this.info(message, ...args);
    }
  }
}