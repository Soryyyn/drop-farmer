const path = require("path");

module.exports = {
    packagerConfig: {
        icon: "resources/icon"
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
                iconUrl: "https://www.dropbox.com/s/gckge20qqx0t4sk/icon.ico?dl=1",
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
        {
            name: "@electron-forge/plugin-webpack",
            config: {
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
                },
                port: 3001
            }
        }
    ]

}