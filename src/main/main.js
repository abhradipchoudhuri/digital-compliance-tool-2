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
  } catch (_) {
    // Electron reload not available, continue without it
  }
}

function createMenu() {
  const template = [
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
              detail: `Version: ${app.getVersion()}\nElectron: ${process.versions.electron}\nA modern desktop application for generating compliant legal copy.`
            });
          }
        }
      ]
    }
  ];

  // Add Quit option differently based on platform
  if (isMac) {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  } else {
    template.unshift({
      label: 'File',
      submenu: [
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
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      preload: path.join(__dirname, '../preload/preload.js'),
      // Allow file:// URLs for Excel files in development
      webSecurity: isDev ? false : true
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
    
    console.log('Digital Compliance Tool started successfully');
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
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
}

function setupIPC() {
  // Handle Excel data loading with ExcelJS (secure)
  ipcMain.handle('load-excel-data', async () => {
    try {
      const excelPath = getExcelFilePath();
      console.log('Loading Excel from:', excelPath);
      
      if (!fs.existsSync(excelPath)) {
        throw new Error(`Excel file not found at: ${excelPath}`);
      }
      
      // Load ExcelJS (secure alternative)
      let ExcelJS;
      try {
        ExcelJS = require('exceljs');
      } catch (excelError) {
        console.error('ExcelJS not available:', excelError);
        throw new Error('ExcelJS library not installed. Run: npm install exceljs');
      }

      // Parse Excel file with ExcelJS
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(excelPath);
      
      const parsedData = {};
      
      // Convert each worksheet to JSON format
      workbook.eachSheet((worksheet, sheetId) => {
        const sheetName = worksheet.name;
        const rows = [];
        
        // Get all rows including header
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
          const rowData = [];
          row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            // Get cell value, handling different cell types
            let value = cell.value;
            
            // Handle rich text
            if (value && typeof value === 'object' && value.richText) {
              value = value.richText.map(t => t.text).join('');
            }
            
            // Handle hyperlinks
            if (value && typeof value === 'object' && value.text) {
              value = value.text;
            }
            
            // Handle formulas - use result value
            if (value && typeof value === 'object' && value.result !== undefined) {
              value = value.result;
            }
            
            // Convert to string, handle nulls
            rowData.push(value !== null && value !== undefined ? String(value) : '');
          });
          
          rows.push(rowData);
        });
        
        parsedData[sheetName] = rows;
      });

      console.log('Excel data parsed successfully with ExcelJS. Sheets:', Object.keys(parsedData));
      
      return {
        success: true,
        data: parsedData,
        filePath: excelPath,
        parsed: true,
        sheets: Object.keys(parsedData),
        parser: 'exceljs'
      };
      
    } catch (error) {
      console.error('Error loading Excel data:', error);
      return {
        success: false,
        error: error.message,
        parsed: false
      };
    }
  });

  // Handle copy generation
  ipcMain.handle('generate-copy', async (event, params) => {
    try {
      console.log('Generate copy request:', params);
      
      // Validate parameters
      const validationErrors = [];
      
      if (!params.assetType || typeof params.assetType !== 'string') {
        validationErrors.push('Asset type is required');
      }
      
      if (!params.countryCode || typeof params.countryCode !== 'string') {
        validationErrors.push('Country code is required');
      }
      
      if (!Array.isArray(params.brandIds) || params.brandIds.length === 0) {
        validationErrors.push('At least one brand must be selected');
      }
      
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      
      return {
        success: true,
        timestamp: new Date().toISOString(),
        params: params
      };
      
    } catch (error) {
      console.error('Error generating copy:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Template validation handler
  ipcMain.handle('validate-template-params', async (event, params) => {
    try {
      console.log('Template validation request:', params);
      
      if (!params || typeof params !== 'object') {
        throw new Error('Invalid parameters provided');
      }
      
      const validationResult = {
        valid: true,
        errors: [],
        warnings: []
      };
      
      if (params.template && typeof params.template === 'string') {
        const braceCount = (params.template.match(/{/g) || []).length;
        const closeBraceCount = (params.template.match(/}/g) || []).length;
        
        if (braceCount !== closeBraceCount) {
          validationResult.valid = false;
          validationResult.errors.push('Template has unbalanced braces');
        }
      }
      
      return {
        success: true,
        validation: validationResult
      };
      
    } catch (error) {
      console.error('Error validating template params:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Get template variables
  ipcMain.handle('get-template-variables', async () => {
    try {
      const variables = [
        'BRAND_NAME', 'BRAND_ENTITY', 'TRADEMARK', 'RESERVE_TRADEMARK',
        'COMPLIANCE_TEXT', 'FORWARD_NOTICE', 'COUNTRY', 'COUNTRY_CODE',
        'LANGUAGE', 'ASSET_TYPE', 'CURRENT_YEAR', 'CURRENT_DATE'
      ];
      
      return {
        success: true,
        variables: variables
      };
      
    } catch (error) {
      console.error('Error getting template variables:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Export generation history
  ipcMain.handle('export-generation-history', async (event, historyData) => {
    try {
      const exportData = {
        exportedAt: new Date().toISOString(),
        appVersion: app.getVersion(),
        totalEntries: historyData ? historyData.length : 0,
        history: historyData || []
      };
      
      return {
        success: true,
        exportData: exportData
      };
      
    } catch (error) {
      console.error('Error exporting history:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Handle app info requests
  ipcMain.handle('get-app-info', async () => {
    try {
      return {
        success: true,
        name: app.getName(),
        version: app.getVersion(),
        platform: process.platform,
        arch: process.arch,
        electron: process.versions.electron,
        chrome: process.versions.chrome,
        node: process.versions.node
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Get system info
  ipcMain.handle('get-system-info', async () => {
    try {
      return {
        success: true,
        platform: process.platform,
        arch: process.arch,
        versions: process.versions,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Handle file save operations
  ipcMain.handle('save-file-dialog', async (event, options = {}) => {
    try {
      const defaultOptions = {
        title: 'Save Generated Copy',
        defaultPath: path.join(app.getPath('documents'), 'compliance-copy.txt'),
        filters: [
          { name: 'Text Files', extensions: ['txt'] },
          { name: 'HTML Files', extensions: ['html'] },
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      };
      
      const result = await dialog.showSaveDialog(mainWindow, {
        ...defaultOptions,
        ...options
      });
      
      return result;
      
    } catch (error) {
      console.error('Save dialog error:', error);
      return { 
        canceled: true, 
        error: error.message 
      };
    }
  });

  // Write file handler
  ipcMain.handle('write-file', async (event, filePath, content, options = {}) => {
    try {
      if (!filePath || typeof filePath !== 'string') {
        throw new Error('Invalid file path provided');
      }
      
      const writeOptions = {
        encoding: 'utf8',
        ...options
      };
      
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(filePath, content, writeOptions);
      
      return {
        success: true,
        filePath: filePath
      };
      
    } catch (error) {
      console.error('Error writing file:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });
}

function getExcelFilePath() {
  const possiblePaths = [
    // Development paths
    path.join(__dirname, '../../data/templates/EXTERNAL - Trademark Tool Data (1).xlsx'),
    path.join(__dirname, '../../data/templates/trademark-data.xlsx'),
    // Production paths
    path.join(process.resourcesPath || '', 'data/templates/EXTERNAL - Trademark Tool Data (1).xlsx'),
    path.join(process.resourcesPath || '', 'data/templates/trademark-data.xlsx')
  ];
  
  // Find the first path that exists
  for (const excelPath of possiblePaths) {
    if (fs.existsSync(excelPath)) {
      console.log('Found Excel file at:', excelPath);
      return excelPath;
    }
  }
  
  // Return the primary development path as fallback
  return possiblePaths[0];
}

// App event handlers
app.whenReady().then(() => {
  console.log('Digital Compliance Tool starting...');
  
  createMenu();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Set up auto-updater (disabled in development)
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    console.log('Blocked new window creation for:', navigationUrl);
    event.preventDefault();
  });
});

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available.');
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available.');
});

autoUpdater.on('error', (err) => {
  console.log('Error in auto-updater. ' + err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  console.log(log_message);
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded');
  autoUpdater.quitAndInstall();
});

// Handle protocol for deep linking (future feature)
if (!app.isDefaultProtocolClient('bf-compliance')) {
  app.setAsDefaultProtocolClient('bf-compliance');
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  app.quit();
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  app.quit();
});