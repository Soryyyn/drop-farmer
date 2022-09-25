require('dotenv').config();

module.exports = {
    packagerConfig: {
        icon: "./resources/icon.ico"
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
                iconURL: "https://raw.githubusercontent.com/Soryyyn/drop-farmer/master/resources/icon.ico",
                setupIcon: "./resources/icon.ico"
            }
        },
        {
            name: "@electron-forge/maker-deb",
            config: {
                debianArch: "arm64",
                icon: "./resources/icon.png"
            }
        }
    ],
    publisher: [
        {
            name: "@electron-forge/publisher-github",
            config: {
                repository: {
                    owner: "Soryyyn",
                    name: "drop-farmer"
                },
                draft: true,
                authToken: process.env.GITHUB_TOKEN
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