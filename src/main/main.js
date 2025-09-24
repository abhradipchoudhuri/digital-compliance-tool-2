const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

// Keep a global reference of the window object
let mainWindow;

const isDev = process.env.NODE_ENV === 'development';
const isMac = process.platform === 'darwin';

// Enable live reload for development
if (isDev) {
  try {
    require('electron-reload')(__dirname, {
      electron: path.join(__dirname, '..', '..', 'node_modules', '.bin', 'electron'),
      hardResetMethod: 'exit'
    });
  } catch (_) {}
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Reload Data',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.webContents.send('reload-excel-data');
          }
        },
        {
          label: 'Export History',
          accelerator: 'CmdOrCtrl+E',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow, {
              title: 'Export Generation History',
              defaultPath: path.join(app.getPath('documents'), 'compliance-history.json'),
              filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            });
            
            if (!result.canceled) {
              mainWindow.webContents.send('export-history-to-file', result.filePath);
            }
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Digital Compliance Tool',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About',
              message: 'Digital Compliance Tool',
              detail: `Version: ${app.getVersion()}\nElectron: ${process.versions.electron}\nNode.js: ${process.versions.node}\nChrome: ${process.versions.chrome}\n\nA modern desktop application for generating compliant legal copy for digital marketing assets.`
            });
          }
        },
        {
          label: 'System Information',
          click: () => {
            const sysInfo = {
              'App Version': app.getVersion(),
              'Electron Version': process.versions.electron,
              'Node.js Version': process.versions.node,
              'Chrome Version': process.versions.chrome,
              'Platform': process.platform,
              'Architecture': process.arch,
              'Working Directory': process.cwd(),
              'Executable Path': process.execPath
            };
            
            const details = Object.entries(sysInfo)
              .map(([key, value]) => `${key}: ${value}`)
              .join('\n');
            
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'System Information',
              message: 'Digital Compliance Tool - System Info',
              detail: details,
              buttons: ['Copy to Clipboard', 'OK'],
              defaultId: 1
            }).then(result => {
              if (result.response === 0) {
                require('electron').clipboard.writeText(details);
              }
            });
          }
        }
      ]
    }
  ];

  // Add Mac-specific menu adjustments
  if (isMac) {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        {
          label: 'Preferences',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('show-preferences');
          }
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    show: false, // Don't show until ready
    icon: path.join(__dirname, '../../assets/icons/icon.png'),
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      preload: path.join(__dirname, '../preload/preload.js'),
      // Allow file:// URLs for Excel files in development
      webSecurity: isDev ? false : true,
      // Additional security
      allowRunningInsecureContent: false,
      experimentalFeatures: false
    }
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../..', 'dist', 'index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Open DevTools in development
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
    
    // Log startup success
    console.log('Digital Compliance Tool started successfully');
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle app focus (for window state management)
  mainWindow.on('focus', () => {
    console.log('Application focused');
  });

  mainWindow.on('blur', () => {
    console.log('Application lost focus');
  });

  // Set up security
  setupSecurity();
  
  // Set up IPC handlers
  setupIPC();
}

function setupSecurity() {
  // Prevent new window creation
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    console.log('Blocked attempt to open external URL:', url);
    return { action: 'deny' };
  });

  // Prevent navigation to external URLs
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'http://localhost:3000' && !navigationUrl.startsWith('file://')) {
      console.log('Blocked navigation to external URL:', navigationUrl);
      event.preventDefault();
    }
  });

  // Handle certificate errors
  mainWindow.webContents.on('certificate-error', (event, url, error, certificate, callback) => {
    if (isDev) {
      // In development, ignore certificate errors
      event.preventDefault();
      callback(true);
    } else {
      // In production, use default behavior
      callback(false);
    }
  });
}

function setupIPC() {
  // Enhanced Excel data loading with SheetJS parsing
  ipcMain.handle('load-excel-data', async () => {
    try {
      const excelPath = getExcelFilePath();
      console.log('Loading Excel from:', excelPath);
      
      if (!fs.existsSync(excelPath)) {
        throw new Error(`Excel file not found at: ${excelPath}`);
      }
      
      // Load SheetJS dynamically to avoid bundling issues
      let XLSX;
      try {
        XLSX = require('xlsx');
      } catch (xlsxError) {
        console.warn('SheetJS not available, returning raw buffer:', xlsxError.message);
        const excelBuffer = fs.readFileSync(excelPath);
        return {
          success: true,
          data: null, // Will be parsed in renderer process
          rawBuffer: Array.from(excelBuffer),
          filePath: excelPath,
          parsed: false
        };
      }

      // Parse Excel file with SheetJS
      const workbook = XLSX.readFile(excelPath);
      const parsedData = {};
      
      // Convert each sheet to JSON
      Object.keys(workbook.Sheets).forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        parsedData[sheetName] = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          raw: false,
          defval: ''
        });
      });

      console.log('Excel data parsed successfully. Sheets:', Object.keys(parsedData));
      
      return {
        success: true,
        data: parsedData,
        filePath: excelPath,
        parsed: true,
        sheets: Object.keys(parsedData),
        metadata: {
          loadedAt: new Date().toISOString(),
          fileSize: fs.statSync(excelPath).size,
          sheetCount: Object.keys(parsedData).length
        }
      };
    } catch (error) {
      console.error('Error loading Excel data:', error);
      return {
        success: false,
        error: error.message,
        filePath: null,
        parsed: false
      };
    }
  });

  // Enhanced copy generation handler
  ipcMain.handle('generate-copy', async (event, params) => {
    try {
      console.log('Generate copy request received:', {
        assetType: params.assetType,
        countryCode: params.countryCode,
        brandCount: params.brandIds?.length || 0,
        timestamp: new Date().toISOString()
      });
      
      // Enhanced parameter validation
      const validationErrors = [];
      
      if (!params.assetType || typeof params.assetType !== 'string') {
        validationErrors.push('Asset type is required and must be a string');
      }
      
      if (!params.countryCode || typeof params.countryCode !== 'string') {
        validationErrors.push('Country code is required and must be a string');
      }
      
      if (!Array.isArray(params.brandIds) || params.brandIds.length === 0) {
        validationErrors.push('At least one brand must be selected');
      }
      
      if (params.brandIds && params.brandIds.some(id => !id || typeof id !== 'string')) {
        validationErrors.push('All brand IDs must be valid strings');
      }
      
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      
      // Log generation attempt for audit purposes
      const generationLog = {
        timestamp: new Date().toISOString(),
        params: params,
        success: true,
        processId: process.pid
      };
      
      console.log('Copy generation validated successfully:', generationLog);
      
      return {
        success: true,
        timestamp: generationLog.timestamp,
        params: params,
        message: 'Copy generation request processed successfully'
      };
      
    } catch (error) {
      console.error('Error in copy generation:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  });

  // Template validation handler
  ipcMain.handle('validate-template-params', async (event, params) => {
    try {
      console.log('Template validation request:', params);
      
      if (!params || typeof params !== 'object') {
        throw new Error('Invalid parameters provided for template validation');
      }
      
      const validationResult = {
        valid: true,
        errors: [],
        warnings: []
      };
      
      // Basic template validation
      if (params.template && typeof params.template === 'string') {
        const braceCount = (params.template.match(/{/g) || []).length;
        const closeBraceCount = (params.template.match(/}/g) || []).length;
        
        if (braceCount !== closeBraceCount) {
          validationResult.valid = false;
          validationResult.errors.push('Template has unbalanced braces');
        }
        
        if (params.template.includes('{}')) {
          validationResult.warnings.push('Template contains empty placeholders');
        }
      }
      
      return {
        success: true,
        validation: validationResult,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error validating template params:', error);
      return {
        success: false,
        error: error.message,
        validation: { valid: false, errors: [error.message] }
      };
    }
  });

  // Get available template variables
  ipcMain.handle('get-template-variables', async () => {
    try {
      const variables = [
        'BRAND_NAME', 'BRAND_ENTITY', 'TRADEMARK', 'RESERVE_TRADEMARK',
        'COMPLIANCE_TEXT', 'FORWARD_NOTICE', 'COUNTRY', 'COUNTRY_CODE',
        'LANGUAGE', 'ASSET_TYPE', 'CURRENT_YEAR', 'CURRENT_DATE'
      ];
      
      return {
        success: true,
        variables: variables,
        count: variables.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting template variables:', error);
      return {
        success: false,
        error: error.message,
        variables: []
      };
    }
  });

  // Export generation history
  ipcMain.handle('export-generation-history', async (event, historyData) => {
    try {
      if (!historyData || !Array.isArray(historyData)) {
        throw new Error('Invalid history data provided');
      }
      
      const exportData = {
        exportedAt: new Date().toISOString(),
        appVersion: app.getVersion(),
        platform: process.platform,
        totalEntries: historyData.length,
        history: historyData
      };
      
      console.log(`Exporting ${historyData.length} history entries`);
      
      return {
        success: true,
        exportData: exportData,
        filename: `compliance-history-${new Date().toISOString().split('T')[0]}.json`
      };
      
    } catch (error) {
      console.error('Error exporting history:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Get app information
  ipcMain.handle('get-app-info', async () => {
    try {
      const appInfo = {
        name: app.getName(),
        version: app.getVersion(),
        platform: process.platform,
        arch: process.arch,
        electron: process.versions.electron,
        chrome: process.versions.chrome,
        node: process.versions.node,
        workingDirectory: process.cwd(),
        resourcesPath: process.resourcesPath || 'N/A',
        userData: app.getPath('userData'),
        documents: app.getPath('documents'),
        temp: app.getPath('temp')
      };
      
      return {
        success: true,
        ...appInfo
      };
    } catch (error) {
      console.error('Error getting app info:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Enhanced file save operations
  ipcMain.handle('save-file-dialog', async (event, options = {}) => {
    try {
      const defaultOptions = {
        title: 'Save Generated Copy',
        defaultPath: path.join(app.getPath('documents'), 'compliance-copy.txt'),
        filter