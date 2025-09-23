// src/renderer/utils/logger.js
// Logger utility for the Digital Compliance Tool

export class Logger {
    constructor(context = 'App') {
      this.context = context;
      this.isDev = process.env.NODE_ENV === 'development';
    }
  
    info(message, ...args) {
      if (this.isDev) {
        console.log(`[${this.context}] INFO: ${message}`, ...args);
      }
    }
  
    warn(message, ...args) {
      console.warn(`[${this.context}] WARN: ${message}`, ...args);
    }
  
    error(message, ...args) {
      console.error(`[${this.context}] ERROR: ${message}`, ...args);
    }
  
    debug(message, ...args) {
      if (this.isDev) {
        console.debug(`[${this.context}] DEBUG: ${message}`, ...args);
      }
    }
  
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