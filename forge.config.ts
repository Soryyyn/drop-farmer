import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import { PublisherGithub } from '@electron-forge/publisher-github';
import { ForgeConfig } from '@electron-forge/shared-types';
import { resolve } from 'path';
import { MainProcessConfig, RendererProcessConfig } from './webpack.config';

const Config: ForgeConfig = {
    packagerConfig: {
        icon: 'resources/icon-normal',
        asar: true,
        name: 'Drop Farmer'
    },
    makers: [
        new MakerSquirrel({
            name: 'drop-farmer',
            authors: 'Soryn Bächli',
            iconUrl: 'https://www.dropbox.com/s/gckge20qqx0t4sk/icon.ico?dl=1',
            setupIcon: resolve(__dirname, 'resources', 'icon-normal.ico')
        })
    ],
    publishers: [
        new PublisherGithub({
            draft: true,
            repository: {
                owner: 'Soryyyn',
                name: 'drop-farmer'
            }
        })
    ],
    plugins: [
        new WebpackPlugin({
            mainConfig: MainProcessConfig,
            renderer: {
                config: RendererProcessConfig,
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
        })
    ]
};

export default Config;
