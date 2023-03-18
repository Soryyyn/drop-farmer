const path = require('path');

/**
 * If asar compressing should be enabled.
 *
 * NOTE: Currently, asar packaging does not work on raspberry pi via the github
 * build.
 */
function allowAsar() {
    if (process.platform === 'linux') {
        return false;
    }

    return true;
}

module.exports = {
    packagerConfig: {
        icon: 'resources/icon-normal',
        asar: allowAsar(),
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
                mainConfig: './webpack.main.config.js',
                renderer: {
                    config: './webpack.renderer.config.js',
                    entryPoints: [
                        {
                            html: './src/renderer/index.html',
                            js: './src/renderer/renderer.tsx',
                            name: 'main_window',
                            preload: {
                                js: './src/main/preload.js'
                            }
                        }
                    ]
                }
            }
        }
    ]
};
