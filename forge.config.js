require('dotenv').config();
const path = require("path");

module.exports = {
    packagerConfig: {
        icon: path.resolve(__dirname, "resources", "icon.ico")
    },
    makers: [
        {
            name: "@electron-forge/maker-squirrel",
            platforms: [
                "win64",
                "win32"
            ],
            config: {
                name: "drop-farmer",
                authors: "Soryn Bächli",
                iconURL: "https://raw.githubusercontent.com/Soryyyn/drop-farmer/master/resources/icon.ico",
                setupIcon: path.resolve(__dirname, "resources", "icon.ico")
            }
        },
        {
            name: "@electron-forge/maker-deb",
            config: {
                debianArch: "arm64",
                icon: path.resolve(__dirname, "resources", "icon.png")
            }
        }
    ],
    publishers: [
        {
            name: "@electron-forge/publisher-github",
            config: {
                repository: {
                    owner: "Soryyyn",
                    name: "drop-farmer"
                },
                draft: true
            }
        }
    ],
    plugins: [
        [
            "@electron-forge/plugin-webpack",
            {
                mainConfig: "./webpack.main.config.js",
                renderer: {
                    config: "./webpack.renderer.config.js",
                    entryPoints: [
                        {
                            html: "./src/renderer/index.html",
                            js: "./src/renderer/renderer.tsx",
                            name: "main_window",
                            preload: {
                                "js": "./src/main/preload.js"
                            }
                        }
                    ]
                }
            }
        ]
    ]

}