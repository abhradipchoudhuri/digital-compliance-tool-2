const { app, BrowserWindow, ipcMain, dialog } = require('electron');
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
      // Allow file:// URLs for Excel files
      webSecurity: isDev ? false : true,
    }
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../..', 'dist', 'index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focus on window
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
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
    // Allow only specific URLs or deny all
    return { action: 'deny' };
  });

  // Prevent navigation to external URLs
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'http://localhost:3000' && !navigationUrl.startsWith('file://')) {
      event.preventDefault();
    }
  });
}

function setupIPC() {
  // Handle Excel data loading
  ipcMain.handle('load-excel-data', async () => {
    try {
      const excelPath = getExcelFilePath();
      console.log('Loading Excel from:', excelPath);
      
      if (!fs.existsSync(excelPath)) {
        throw new Error(`Excel file not found at: ${excelPath}`);
      }
      
      const excelBuffer = fs.readFileSync(excelPath);
      return {
        success: true,
        data: Array.from(excelBuffer), // Convert Buffer to Array for IPC
        filePath: excelPath
      };
    } catch (error) {
      console.error('Error loading Excel data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Handle copy generation
  ipcMain.handle('generate-copy', async (event, params) => {
    try {
      // Log generation request
      console.log('Generate copy request:', params);
      
      // Validate parameters
      if (!params.assetType || !params.countryCode || !Array.isArray(params.brandIds)) {
        throw new Error('Invalid parameters for copy generation');
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

  // Handle app info requests
  ipcMain.handle('get-app-info', async () => {
    return {
      name: app.getName(),
      version: app.getVersion(),
      platform: process.platform,
      arch: process.arch,
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node
    };
  });

  // Handle file save operations (for future export functionality)
  ipcMain.handle('save-file-dialog', async (event, options) => {
    try {
      const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Save Generated Copy',
        defaultPath: path.join(app.getPath('documents'), 'compliance-copy.txt'),
        filters: [
          { name: 'Text Files', extensions: ['txt'] },
          { name: 'HTML Files', extensions: ['html'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        ...options
      });
      
      return result;
    } catch (error) {
      console.error('Save dialog error:', error);
      return { canceled: true, error: error.message };
    }
  });
}

function getExcelFilePath() {
  if (isDev) {
    // Development: use file from project data directory
    return path.join(__dirname, '../../data/templates/trademark-data.xlsx');
  } else {
    // Production: use file from resources
    const resourcePath = process.resourcesPath || path.join(process.cwd(), 'resources');
    return path.join(resourcePath, 'data/templates/trademark-data.xlsx');
  }
}

// App event handlers
app.whenReady().then(() => {
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