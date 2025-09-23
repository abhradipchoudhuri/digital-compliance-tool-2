module.exports = {
    packagerConfig: {
      name: 'Digital Compliance Tool',
      productName: 'Digital Compliance Tool',
      icon: './assets/icons/icon',
      extraResource: [
        {
          from: './data/templates',
          to: 'data/templates',
        },
      ],
    },
    
    rebuildConfig: {},
    
    makers: [
      {
        name: '@electron-forge/maker-squirrel',
        config: {
          name: 'digital_compliance_tool',
          setupIcon: './assets/icons/icon.ico',
          loadingGif: './assets/images/loading.gif',
        },
      },
      {
        name: '@electron-forge/maker-zip',
        platforms: ['darwin'],
      },
      {
        name: '@electron-forge/maker-deb',
        config: {},
      },
    ],
  };