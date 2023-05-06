const path = require('path');
const { mainConfig, rendererConfig } = require('./webpack.config');

module.exports = {
    packagerConfig: {
        icon: 'resources/icon-normal',
        asar: true,
        name: 'Drop Farmer'
    },
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            platforms: ['win32'],
            config: {
                name: 'drop-farmer',
                authors: 'Soryn Bächli',
                iconUrl:
                    'https://www.dropbox.com/s/gckge20qqx0t4sk/icon.ico?dl=1',
                setupIcon: path.resolve(
                    __dirname,
                    'resources',
                    'icon-normal.ico'
                )
            }
        }
    ],
    publishers: [
        {
            name: '@electron-forge/publisher-github',
            config: {
                repository: {
                    owner: 'Soryyyn',
                    name: 'drop-farmer'
                },
                draft: true
            }
        }
    ],
    plugins: [
        {
            name: '@electron-forge/plugin-webpack',
            config: {
                mainConfig: mainConfig,
                renderer: {
                    config: rendererConfig,
                    entryPoints: [
                        {
                            html: './src/renderer/index.html',
                            js: './src/renderer/renderer.tsx',
                            name: 'main_window',
                            preload: {
                                js: './src/exposed/preload.ts'
                            }
                        }
                    ]
                }
            }
        }
    ]
};
