// src/main/main.js
// Electron Main Process - Complete with Fixed ExcelJS Parsing and CORRECT FILENAME

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');

// Auto-updater (for production builds)
const { autoUpdater } = require('electron-updater');

// Environment detection
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const isMac = process.platform === 'darwin';

// Keep a global reference of the window object
let mainWindow;

// Import menu configuration
const { createMenu } = require('./menu');

// ============================================
// CREATE MAIN WINDOW
// ============================================
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    title: 'Digital Compliance Tool',
    icon: path.join(__dirname, '../assets/icons/icon.png'),
    backgroundColor: '#002E5D', // BF Blue
    show: false, // Don't show until ready-to-show
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/preload.js'),
      sandbox: true,
      webSecurity: isDev ? false : true,
      allowRunningInsecureContent: isDev ? true : false
    }
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    // ✅ REMOVED: DevTools no longer open automatically
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../..', 'dist', 'index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // ✅ REMOVED: DevTools no longer open automatically in development
    // if (isDev) {
    //   mainWindow.webContents.openDevTools();
    // }
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

// ============================================
// FUNCTION TO GET MAIN WINDOW (for menu access)
// ============================================
function getMainWindow() {
  return mainWindow;
}

// ============================================
// SECURITY SETUP
// ============================================
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

// ============================================
// EXCEL FILE PATH RESOLVER
// ✅ FIXED: Correct filename with underscores
// ============================================
function getExcelFilePath() {
  if (isDev) {
    // Development: use file from project data directory
    // ✅ CORRECT FILENAME: EXTERNAL__Trademark_Tool_Data_LCG_2_0.xlsx
    const devPath = path.join(__dirname, '../../data/templates/EXTERNAL__Trademark_Tool_Data_LCG_2_0.xlsx');
    console.log('Development Excel path:', devPath);
    return devPath;
  } else {
    // Production: use file from resources
    const resourcePath = process.resourcesPath || path.join(process.cwd(), 'resources');
    const prodPath = path.join(resourcePath, 'data/templates/EXTERNAL__Trademark_Tool_Data_LCG_2_0.xlsx');
    console.log('Production Excel path:', prodPath);
    return prodPath;
  }
}

// ============================================
// IPC HANDLERS SETUP
// ============================================
function setupIPC() {
  // ============================================
  // EXCEL DATA LOADING WITH FIXED PARSER
  // ============================================
  ipcMain.handle('load-excel-data', async () => {
    try {
      const excelPath = getExcelFilePath();
      console.log('Loading Excel from:', excelPath);
      
      // Verify file exists
      if (!fs.existsSync(excelPath)) {
        throw new Error(`Excel file not found at: ${excelPath}`);
      }
      
      // Parse Excel file with ExcelJS
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(excelPath);
      
      console.log('Excel file loaded, parsing sheets...');
      
      // Convert workbook to structured data
      const parsedData = {};
      
      workbook.eachSheet((worksheet, sheetId) => {
        const sheetName = worksheet.name;
        const rows = [];
        
        // Get headers from first row
        const headerRow = worksheet.getRow(1);
        const headers = [];
        const maxColumns = headerRow.cellCount;
        
        // ✅ FIXED: Iterate through all columns, including empty ones
        for (let colNumber = 1; colNumber <= maxColumns; colNumber++) {
          const cell = headerRow.getCell(colNumber);
          const headerValue = cell.value;
          
          if (headerValue !== null && headerValue !== undefined && headerValue !== '') {
            // Clean header - trim whitespace
            headers.push(headerValue.toString().trim());
          } else {
            // Mark empty header columns as null so we can skip them later
            headers.push(null);
          }
        }
        
        // Log only non-null headers
        console.log(`Sheet "${sheetName}" headers:`, headers.filter(h => h !== null));
        
        // Process data rows (skip header row)
        let rowCount = 0;
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; // Skip header row
          
          const rowData = {};
          let hasData = false;
          
          
          // This ensures column numbers match the header array indices
          row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const header = headers[colNumber - 1];
            
            // Skip columns with null headers (empty header columns)
            if (header === null || header === undefined) {
              return;
            }
            
            // Handle different cell value types
            let cellValue = cell.value;
            
            // Handle rich text
            if (cellValue && typeof cellValue === 'object' && cellValue.richText) {
              cellValue = cellValue.richText.map(rt => rt.text).join('');
            }
            
            // Handle formulas
            if (cellValue && typeof cellValue === 'object' && cellValue.result !== undefined) {
              cellValue = cellValue.result;
            }
            
            // Handle dates
            if (cell.type === ExcelJS.ValueType.Date && cellValue) {
              cellValue = cellValue.toISOString();
            }
            
            // Only add non-null, non-empty values
            if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
              rowData[header] = cellValue;
              hasData = true;
            }
          });
          
          // Only add non-empty rows
          if (hasData && Object.keys(rowData).length > 0) {
            rows.push(rowData);
            rowCount++;
          }
        });
        
        parsedData[sheetName] = rows;
        console.log(`Parsed sheet "${sheetName}": ${rowCount} rows`);
      });
      
      // Log summary
      console.log('Excel data parsed successfully with ExcelJS. Sheets:', Object.keys(parsedData));
      console.log('Total sheets:', Object.keys(parsedData).length);
      
      // Log sample data from Trademark Config for debugging
      if (parsedData['Trademark Config'] && parsedData['Trademark Config'].length > 0) {
        console.log('Sample Trademark Config row:', parsedData['Trademark Config'][0]);
      }
      
      // Verify critical sheets exist
      if (parsedData['TTB Statements']) {
        console.log(`✅ TTB Statements sheet found: ${parsedData['TTB Statements'].length} rows`);
      }
      if (parsedData['Brand Availability']) {
        console.log(`✅ Brand Availability sheet found: ${parsedData['Brand Availability'].length} rows`);
      }
      
      return {
        success: true,
        data: parsedData,
        filePath: excelPath,
        sheetCount: Object.keys(parsedData).length,
        summary: Object.keys(parsedData).map(sheetName => ({
          name: sheetName,
          rows: parsedData[sheetName].length
        }))
      };
      
    } catch (error) {
      console.error('Error loading Excel data:', error);
      return {
        success: false,
        error: error.message,
        stack: isDev ? error.stack : undefined
      };
    }
  });

  // ============================================
  // COPY GENERATION HANDLER
  // ============================================
  ipcMain.handle('generate-copy', async (event, params) => {
    try {
      console.log('Generate copy request:', params);
      
      // Validate parameters
      if (!params.assetType || !params.countryCode || !Array.isArray(params.brandIds)) {
        throw new Error('Invalid parameters for copy generation');
      }
      
      // TODO: Implement actual copy generation logic
      // This is a placeholder that will be implemented in later artifacts
      
      return {
        success: true,
        timestamp: new Date().toISOString(),
        params: params,
        generatedCopy: {
          html: '<p>Generated copy will appear here</p>',
          plainText: 'Generated copy will appear here'
        }
      };
    } catch (error) {
      console.error('Error generating copy:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // ============================================
  // APP INFO HANDLER
  // ============================================
  ipcMain.handle('get-app-info', async () => {
    return {
      name: app.getName(),
      version: app.getVersion(),
      platform: process.platform,
      arch: process.arch,
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node,
      isDev: isDev
    };
  });

  // ============================================
  // FILE SAVE DIALOG HANDLER
  // ============================================
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
      return { 
        canceled: true, 
        error: error.message 
      };
    }
  });

  // ============================================
  // SAVE FILE HANDLER
  // ============================================
  ipcMain.handle('save-file', async (event, { filePath, content }) => {
    try {
      fs.writeFileSync(filePath, content, 'utf8');
      return { 
        success: true, 
        filePath 
      };
    } catch (error) {
      console.error('Error saving file:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  });
}

// ============================================
// APP EVENT HANDLERS
// ============================================
app.whenReady().then(() => {
  createMenu(getMainWindow); // Pass getMainWindow function to menu
  createWindow();

  app.on('activate', () => {
    // On macOS, re-create window when dock icon is clicked
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
  // On macOS, apps stay active until user quits explicitly
  if (!isMac) {
    app.quit();
  }
});

// ============================================
// SECURITY: PREVENT NEW WINDOW CREATION
// ============================================
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    console.warn('Blocked new window creation:', navigationUrl);
  });
});

// ============================================
// AUTO-UPDATER EVENTS
// ============================================
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info);
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available.');
});

autoUpdater.on('error', (err) => {
  console.log('Error in auto-updater:', err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = `Download speed: ${progressObj.bytesPerSecond}`;
  log_message += ` - Downloaded ${progressObj.percent}%`;
  log_message += ` (${progressObj.transferred}/${progressObj.total})`;
  console.log(log_message);
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded');
  // Auto-install update on quit
  autoUpdater.quitAndInstall();
});

// ============================================
// PROTOCOL HANDLER FOR DEEP LINKING
// ============================================
if (!app.isDefaultProtocolClient('bf-compliance')) {
  app.setAsDefaultProtocolClient('bf-compliance');
}

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  app.quit();
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  app.quit();
});

// ============================================
// UNCAUGHT EXCEPTION HANDLER
// ============================================
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  if (!isDev) {
    // In production, log to file or error reporting service
    // For now, just log to console
  }
});