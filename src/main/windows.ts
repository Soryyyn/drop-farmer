import { BrowserWindow } from "electron";
import { destroyAllWindows } from "./farms";
import { GameFarmTemplate } from "./games/gameFarmTemplate";
import { log } from "./logger";

/**
 * Pick up constant from electron-forge for the main window entry and the
 * preload file entry.
 * Depends on production and development.
 */
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let mainWindow: BrowserWindow;

/**
 * Creates the main react window.
 */
export function createMainWindow(): void {
    mainWindow = new BrowserWindow({
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
            color: "#c8def5",
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
        log("INFO", "Created main window; showing now");
        mainWindow.show();
        mainWindow.focus();
    });

    /**
     * When close button on main windows is clicked.
     */
    // TODO: Change to "close to tray" when functionality is added.
    mainWindow.on("close", () => {
        destroyAllWindows();
    });
}

/**
 * Returns the main react application window.
 */
export function getMainWindow(): BrowserWindow {
    return mainWindow;
}

/**
 * Create the farm window.
 *
 * @param {string} url The url which should load on window creation.
 * @param {string} gameName The name of the game to create the window for.
 */
export async function createFarmWindow(url: string, gameName: string) {
    const window = new BrowserWindow({
        height: 1080,
        width: 1920,
        show: false,
        closable: false,
    });

    await window.loadURL(url);

    /**
     * Mute window.
     */
    window.webContents.setAudioMuted(true);

    log("INFO", `Created farm window for \"${gameName}\"`);
    return window;
}


/**
 * Destroy the wanted window.
 *
 * @param {Electron.BrowserWindow} window The window to destroy.
 */
export function destroyWindow(window: Electron.BrowserWindow): void {
    window.destroy();
}