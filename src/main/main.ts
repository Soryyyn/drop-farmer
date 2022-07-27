import { app, BrowserWindow } from "electron";
import { initLogger } from "./logger";
import { initSettings } from "./settings";
import { initFarms } from "./farms";

/**
 * Pick up constant from electron-forge for the main window entry.
 * Depends on production and development.
 */
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;

/**
 * Handling the creating/deletion of shortcuts when installing/uninstalling via squirrel.
 */
if (require("electron-squirrel-startup")) {
    app.quit();
}

/**
 * Creates the main react window.
 */
function createWindow(): void {
    const mainWindow = new BrowserWindow({
        height: 600,
        width: 800,
        center: true,
        show: false,
        title: "drop-farmer",
        autoHideMenuBar: true,
        titleBarStyle: "hidden",
        titleBarOverlay: {
            color: "#a7b8d9",
            symbolColor: "#000000",
        },
    });

    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    /**
     * Show when the window is ready.
     */
    mainWindow.on("ready-to-show", () => {
        mainWindow.show();
    });
};

/**
 * Gets executed when electron has finished starting.
 * Some API's might only be available after it has started.
 */
app.on("ready", () => {
    createWindow();

    initLogger();
    initSettings();
    initFarms();
});