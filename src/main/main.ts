import { app, BrowserWindow } from "electron";
import { initLogger } from "./logger";
import { initSettings } from "./settings";
import { initFarms } from "./farms";

/**
 * Pick up constant from electron-forge for the main window entry and the
 * preload file entry.
 * Depends on production and development.
 */
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

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
        height: 800,
        width: 1200,
        center: true,
        maximizable: false,
        resizable: false,
        show: false,
        title: "drop-farmer",
        autoHideMenuBar: true,
        titleBarStyle: "hidden",
        titleBarOverlay: {
            color: "#bad5f1",
            symbolColor: "#000000",
        },
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
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
    /**
     * Load all ipc listeners when the app is ready.
     */
    require("./ipc");

    /**
     * Initialize all drop-farmer background functions.
     */
    initLogger();
    initSettings();
    initFarms();

    /**
     * Finally, create the actual application window and show it when it has
     * been created.
     */
    createWindow();
});