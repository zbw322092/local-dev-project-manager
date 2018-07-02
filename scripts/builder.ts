import * as builder from 'electron-builder';

builder.build({
  config: {
    appId: 'bowenwebtech.com.LocalDevProjectManager',
    productName: 'venus manager',
    copyright: 'Copyright © 2018 Bowen',
    icon: '../dist/icon.png',
    directories: {
      output: 'dist/'
    },
    mac: {
      category: 'public.app-category.utilities'
    }
  }
}).then(() => {
  console.log('app build successfully');
}).catch((err) => {
  console.log(`app build error: ${err}`);
});