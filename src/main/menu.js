// src/main/menu.js
// Simplified Application Menu - Window and Help only

const { Menu, shell, app } = require('electron');

const isMac = process.platform === 'darwin';

function createMenu() {
  const template = [
    // Window Menu
    {
      label: 'Window',
      submenu: [
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        }
      ]
    },
    // Help Menu
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Digital Compliance Tool',
          click: async () => {
            const { dialog } = require('electron');
            dialog.showMessageBox({
              type: 'info',
              title: 'About Digital Compliance Tool',
              message: 'Digital Compliance Tool',
              detail: `Version: ${app.getVersion()}\n\nBuilt for Brown-Forman Corporation\n\nA desktop application for generating legal compliance copy for digital marketing assets worldwide.`,
              buttons: ['OK']
            });
          }
        },
        {
          label: 'Resource Library',
          click: async () => {
            await shell.openExternal('https://sites.google.com/b-f.com/bf-digital-compliance/required-copy/resource-library');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

module.exports = { createMenu };