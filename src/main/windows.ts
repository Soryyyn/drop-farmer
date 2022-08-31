import { BrowserWindow } from "electron";
import { resolve } from "path";
import { getFarms } from "./farms";
import { log } from "./logger";
import { getCurrentSettings } from "./settings";
import { isQuitting } from "./tray";

/**
 * Pick up constant from electron-forge for the main window entry and the
 * preload file entry.
 * Depends on production and development.
 */
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

/**
 * The main window reference.
 */
let mainWindow: BrowserWindow;

/**
 * Creates the main react window.
 *
 * @param {boolean} isProd If the app is run in production environment.
 */
export function createMainWindow(isProd: boolean): void {
    mainWindow = new BrowserWindow({
        icon: resolve(__dirname, "resources/icon.ico"),
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
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
            devTools: !isProd
        },
    });

    /**
     * Load the react app into the main window.
     */
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    /**
     * Show when the window is ready.
     */
    mainWindow.on("ready-to-show", () => {
        if (getCurrentSettings().showMainWindowOnLaunch) {
            log("MAIN", "INFO", `Created main window (shown) ${(!isProd ? "in dev mode" : "")}`);
            mainWindow.show();
            mainWindow.focus();
        } else {
            log("MAIN", "INFO", `Created main window (hidden) ${(!isProd ? "in dev mode" : "")}`);
        }
    });

    /**
     * When close button on main windows is clicked.
     * Prevent default electron action from close.
     */
    mainWindow.on("close", (event) => {
        event.preventDefault();
        if (!isQuitting()) {
            hideWindow(mainWindow, true);

            /**
             * Hide all farm windows as well.
             */
            getFarms().forEach((farm) => {
                farm.hideWindows();
            });
        } else {
            destroyWindow(mainWindow);
        }
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
        icon: resolve(__dirname, "resources/icon.ico"),
        height: 1080,
        width: 1920,
        show: false,
        closable: false,
        webPreferences: {
            devTools: !(process.env.NODE_ENV === "production")
        }
    });

    await window.loadURL(url);

    /**
     * Mute window.
     */
    muteWindow(window);

    log("MAIN", "INFO", `Created window for \"${gameName}\"`);
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

/**
 * Show the wanted window.
 *
 * @param {Electron.BrowserWindow} window The window to show.
 * @param {boolean} isMainWindow If the window is the main application window.
 */
export function showWindow(window: Electron.BrowserWindow, isMainWindow: boolean): void {
    log("MAIN", "INFO", `Showing window ${isMainWindow ? "(main)" : "(" + window.id + ")"}`)
    window.show();
    window.focus();
}

/**
 * Hide the wanted window.
 *
 * @param {Electron.BrowserWindow} window The window to show.
 * @param {boolean} isMainWindow If the window is the main application window.
 */
export function hideWindow(window: Electron.BrowserWindow, isMainWindow: boolean): void {
    log("MAIN", "INFO", `Hidding window ${isMainWindow ? "(main)" : "(" + window.id + ")"}`)
    window.hide();
}

/**
 * Mute the wanted window.
 *
 * @param {Electron.BrowserWindow} window The window to mute.
 */
function muteWindow(window: Electron.BrowserWindow): void {
    window.webContents.setAudioMuted(true);
}

/**
 * Reload the given window.
 *
 * @param {Electron.BrowserWindow} window The window to reload.
 */
export function reloadWindow(window: Electron.BrowserWindow): void {
    window.reload();
}