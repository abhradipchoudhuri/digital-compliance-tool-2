const { autoUpdater } = require('electron-updater');
const { dialog, BrowserWindow } = require('electron');
const log = require('electron-log');

// Configure logging
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

// Disable auto-download
autoUpdater.autoDownload = false;

function setupAutoUpdater() {
  // Check for updates
  autoUpdater.on('checking-for-update', () => {
    log.info('Checking for update...');
  });

  autoUpdater.on('update-available', (info) => {
    log.info('Update available:', info.version);
    
    const mainWindow = BrowserWindow.getFocusedWindow();
    if (mainWindow) {
      const response = dialog.showMessageBoxSync(mainWindow, {
        type: 'info',
        buttons: ['Download', 'Later'],
        defaultId: 0,
        title: 'Update Available',
        message: `Version ${info.version} is available`,
        detail: 'Would you like to download it now?'
      });

      if (response === 0) {
        autoUpdater.downloadUpdate();
      }
    }
  });

  autoUpdater.on('update-not-available', (info) => {
    log.info('Update not available:', info.version);
  });

  autoUpdater.on('error', (err) => {
    log.error('Error in auto-updater:', err);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    const mainWindow = BrowserWindow.getFocusedWindow();
    if (mainWindow) {
      mainWindow.webContents.send('download-progress', progressObj);
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded:', info.version);
    
    const mainWindow = BrowserWindow.getFocusedWindow();
    if (mainWindow) {
      const response = dialog.showMessageBoxSync(mainWindow, {
        type: 'info',
        buttons: ['Restart', 'Later'],
        defaultId: 0,
        title: 'Update Ready',
        message: 'Update downloaded successfully',
        detail: 'The application will restart to apply the update.'
      });

      if (response === 0) {
        setImmediate(() => autoUpdater.quitAndInstall());
      }
    }
  });
}

module.exports = {
  setupAutoUpdater,
  checkForUpdates: () => autoUpdater.checkForUpdatesAndNotify()
};