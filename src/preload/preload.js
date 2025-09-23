const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Excel data loading
  loadExcelData: () => ipcRenderer.invoke('load-excel-data'),
  
  // Copy generation
  generateCopy: (params) => ipcRenderer.invoke('generate-copy', params),
  
  // App info
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  
  // File operations
  saveFileDialog: (options) => ipcRenderer.invoke('save-file-dialog', options),
  
  // Environment info
  getEnvironment: () => ({
    platform: process.platform,
    arch: process.arch,
    versions: process.versions
  })
});

console.log('Digital Compliance Tool - Preload script loaded');