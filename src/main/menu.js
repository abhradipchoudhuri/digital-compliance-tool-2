const { Menu, shell, dialog, app } = require('electron');

const isMac = process.platform === 'darwin';
const isDev = process.env.NODE_ENV === 'development';

function createMenu(mainWindow) {
  const template = [
    // macOS specific menu
    ...(isMac ? [{
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),

    // File menu
    {
      label: 'File',
      submenu: [
        {
          label: 'New Generation',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-generation');
          }
        },
        {
          label: 'Save Copy',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('menu-save-copy');
          }
        },
        { type: 'separator' },
        {
          label: 'Export History',
          click: () => {
            mainWindow.webContents.send('menu-export-history');
          }
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },

    // Edit menu
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac ? [
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
          { type: 'separator' },
          {
            label: 'Speech',
            submenu: [
              { role: 'startSpeaking' },
              { role: 'stopSpeaking' }
            ]
          }
        ] : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ])
      ]
    },

    // View menu
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },

    // Tools menu
    {
      label: 'Tools',
      submenu: [
        {
          label: 'Reload Data',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.webContents.send('menu-reload-data');
          }
        },
        {
          label: 'Clear History',
          click: () => {
            const result = dialog.showMessageBoxSync(mainWindow, {
              type: 'warning',
              buttons: ['Clear', 'Cancel'],
              defaultId: 1,
              cancelId: 1,
              title: 'Clear History',
              message: 'Are you sure you want to clear all generation history?',
              detail: 'This action cannot be undone.'
            });
            
            if (result === 0) {
              mainWindow.webContents.send('menu-clear-history');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('menu-open-settings');
          }
        }
      ]
    },

    // Window menu
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [])
      ]
    },

    // Help menu
    {
      role: 'help',
      submenu: [
        {
          label: 'About Digital Compliance Tool',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About',
              message: 'Digital Compliance Tool',
              detail: `Version: ${app.getVersion()}\nBuilt with Electron ${process.versions.electron}`
            });
          }
        },
        { type: 'separator' },
        {
          label: 'User Guide',
          click: () => {
            mainWindow.webContents.send('menu-show-help');
          }
        },
        {
          label: 'Resource Library',
          click: async () => {
            await shell.openExternal('https://sites.google.com/b-f.com/bf-digital-compliance/required-copy/resource-library');
          }
        },
        { type: 'separator' },
        {
          label: 'Report Issue',
          click: async () => {
            await shell.openExternal('mailto:digital-compliance-support@b-f.com?subject=Digital%20Compliance%20Tool%20Issue');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

module.exports = { createMenu };