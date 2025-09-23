const { session } = require('electron');
const path = require('path');

function setupSecurityPolicies() {
  // Set Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-src 'none'",
    "object-src 'none'"
  ].join('; ');

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp],
        'X-Content-Type-Options': ['nosniff'],
        'X-Frame-Options': ['DENY'],
        'X-XSS-Protection': ['1; mode=block']
      }
    });
  });

  // Block external requests in production
  if (process.env.NODE_ENV === 'production') {
    session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
      const { url } = details;
      
      // Allow local files and resources
      if (url.startsWith('file://') || url.startsWith('devtools://')) {
        callback({});
        return;
      }
      
      // Block external URLs
      callback({ cancel: true });
    });
  }
}

function setupSessionSecurity() {
  // Clear any existing data on startup
  session.defaultSession.clearStorageData({
    storages: ['cookies', 'localStorage', 'sessionStorage', 'websql']
  });

  // Disable features that could be security risks
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    // Deny all permission requests
    callback(false);
  });
}

module.exports = {
  setupSecurityPolicies,
  setupSessionSecurity
};