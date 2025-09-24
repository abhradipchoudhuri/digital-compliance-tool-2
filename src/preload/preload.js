const { contextBridge, ipcRenderer } = require('electron');

// Enhanced error handling for IPC calls
const handleIpcCall = async (channel, ...args) => {
  try {
    const result = await ipcRenderer.invoke(channel, ...args);
    return result;
  } catch (error) {
    console.error(`IPC call failed for ${channel}:`, error);
    return {
      success: false,
      error: error.message || 'IPC communication failed'
    };
  }
};

// Template Engine utilities
const templateUtils = {
  /**
   * Validate placeholder syntax in template strings
   */
  validatePlaceholders: (template) => {
    if (typeof template !== 'string') return { valid: false, errors: ['Template must be a string'] };
    
    const errors = [];
    const placeholders = template.match(/{[^}]*}/g) || [];
    
    // Check for empty placeholders
    if (template.includes('{}')) {
      errors.push('Template contains empty placeholders');
    }
    
    // Check for unbalanced braces
    const openBraces = (template.match(/{/g) || []).length;
    const closeBraces = (template.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push('Template has unbalanced braces');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      placeholderCount: placeholders.length,
      placeholders
    };
  },

  /**
   * Extract variables from template string
   */
  extractVariables: (template) => {
    if (typeof template !== 'string') return [];
    
    const matches = template.match(/{([^}]+)}/g) || [];
    return matches.map(match => match.replace(/[{}]/g, ''));
  },

  /**
   * Format copy for different output types
   */
  formatCopy: (text, format = 'text') => {
    if (!text || typeof text !== 'string') return '';
    
    switch (format.toLowerCase()) {
      case 'html':
        return text.replace(/\n/g, '<br>');
      case 'plain':
      case 'text':
        return text.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '');
      case 'markdown':
        return text.replace(/<br\s*\/?>/gi, '\n').replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
      default:
        return text;
    }
  }
};

// Clipboard utilities
const clipboardUtils = {
  /**
   * Copy text to clipboard with fallback
   */
  copyText: async (text) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return { success: true, method: 'modern' };
      } else {
        // Fallback method
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        textArea.style.pointerEvents = 'none';
        document.body.appendChild(textArea);
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        return { 
          success: successful, 
          method: 'legacy',
          error: successful ? null : 'Copy command failed'
        };
      }
    } catch (error) {
      console.error('Clipboard copy failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Read text from clipboard
   */
  readText: async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        return { success: true, text, method: 'modern' };
      } else {
        return { success: false, error: 'Clipboard read not supported in fallback mode' };
      }
    } catch (error) {
      console.error('Clipboard read failed:', error);
      return { success: false, error: error.message };
    }
  }
};

// File utilities
const fileUtils = {
  /**
   * Generate filename with timestamp
   */
  generateTimestampedFilename: (base, extension) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    return `${base}-${timestamp}.${extension}`;
  },

  /**
   * Validate file extension
   */
  validateExtension: (filename, allowedExtensions = ['txt', 'html', 'json']) => {
    if (!filename || typeof filename !== 'string') return false;
    
    const extension = filename.split('.').pop()?.toLowerCase();
    return allowedExtensions.includes(extension);
  },

  /**
   * Format file size for display
   */
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

// Main API exposure
contextBridge.exposeInMainWorld('electronAPI', {
  // Excel data operations
  loadExcelData: () => handleIpcCall('load-excel-data'),
  reloadExcelData: () => handleIpcCall('load-excel-data'), // Alias for reload
  
  // Template engine operations  
  generateCopy: (params) => handleIpcCall('generate-copy', params),
  validateTemplateParams: (params) => handleIpcCall('validate-template-params', params),
  getTemplateVariables: () => handleIpcCall('get-template-variables'),
  
  // File operations
  saveFileDialog: (options = {}) => handleIpcCall('save-file-dialog', options),
  writeFile: (filePath, content, options = {}) => handleIpcCall('write-file', filePath, content, options),
  exportGenerationHistory: (historyData) => handleIpcCall('export-generation-history', historyData),
  
  // System information
  getAppInfo: () => handleIpcCall('get-app-info'),
  getSystemInfo: () => handleIpcCall('get-system-info'),
  
  // Environment info (enhanced)
  getEnvironment: () => ({
    platform: process.platform,
    arch: process.arch,
    versions: process.versions,
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production'
  }),

  // Utility functions
  utils: {
    template: templateUtils,
    clipboard: clipboardUtils,
    file: fileUtils,
    
    // General utilities
    debounce: (func, wait) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },
    
    throttle: (func, limit) => {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },
    
    generateId: () => {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    formatTimestamp: (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleString();
    },
    
    sanitizeFilename: (filename) => {
      return filename.replace(/[<>:"/\\|?*]/g, '_');
    }
  },

  // Event listeners for main process communication
  events: {
    /**
     * Listen for events from main process
     */
    on: (channel, callback) => {
      const validChannels = [
        'reload-excel-data',
        'export-history-to-file', 
        'show-preferences',
        'app-update-available',
        'app-update-downloaded'
      ];
      
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, callback);
        console.log(`Event listener registered for: ${channel}`);
      } else {
        console.warn(`Invalid event channel: ${channel}`);
      }
    },

    /**
     * Remove event listeners
     */
    off: (channel, callback) => {
      ipcRenderer.removeListener(channel, callback);
      console.log(`Event listener removed for: ${channel}`);
    },

    /**
     * Remove all listeners for a channel
     */
    removeAllListeners: (channel) => {
      ipcRenderer.removeAllListeners(channel);
      console.log(`All listeners removed for: ${channel}`);
    }
  },

  // Development utilities (only available in development)
  dev: process.env.NODE_ENV === 'development' ? {
    /**
     * Log performance metrics
     */
    logPerformance: (label) => {
      if (performance.mark) {
        performance.mark(label);
        console.log(`Performance mark: ${label} at ${performance.now()}ms`);
      }
    },

    /**
     * Get memory usage info
     */
    getMemoryInfo: () => {
      if (performance.memory) {
        return {
          usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB',
          totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1048576) + ' MB',
          jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) + ' MB'
        };
      }
      return null;
    },

    /**
     * Clear console
     */
    clearConsole: () => {
      console.clear();
    }
  } : undefined,

  // Version information
  version: {
    preload: '2.0.0',
    features: [
      'template-engine',
      'enhanced-clipboard',
      'file-operations', 
      'system-info',
      'event-handling',
      'dev-utilities'
    ]
  }
});

// Enhanced startup logging
console.log('Digital Compliance Tool - Enhanced Preload Script Loaded');
console.log('Preload Features:', [
  'Template Engine Support',
  'Enhanced IPC Communication', 
  'Clipboard Utilities',
  'File Operations',
  'Event Handling',
  'Development Tools'
]);

// Environment information
console.log('Environment:', {
  platform: process.platform,
  arch: process.arch,
  nodeVersion: process.versions.node,
  electronVersion: process.versions.electron,
  isDev: process.env.NODE_ENV === 'development'
});

// Global error handling for the preload context
window.addEventListener('error', (event) => {
  console.error('Preload script error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Preload script unhandled promise rejection:', event.reason);
});

// Performance monitoring (development only)
if (process.env.NODE_ENV === 'development') {
  window.addEventListener('load', () => {
    console.log('Renderer load time:', performance.now() + 'ms');
    
    if (performance.memory) {
      console.log('Initial memory usage:', {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB',
        total: Math.round(performance.memory.totalJSHeapSize / 1048576) + ' MB'
      });
    }
  });
}

// Expose a success indicator
window.preloadReady = true;
console.log('Preload script initialization complete');