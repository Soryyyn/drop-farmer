import { BrowserWindow } from "electron";
import { addFarmWindowToArray, getFarmWindows } from "./farms";

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
        mainWindow.show();
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
 * @param {Farm} farm The farm to create the window for.
 */
export function createFarmWindow(farm: Farm): BrowserWindow {
    const window = new BrowserWindow({
        height: 1080,
        width: 1920,
        show: false,
        closable: false
    });

    window.loadURL(farm.websiteToCheck);

    /**
     * Add the window to the farm array.
     */
    addFarmWindowToArray(farm, window);

    return window;
}

/**
 * Show all windows of specified farm.
 *
 * @param {Farm} farm Farm to show all windows for.
 */
export function showFarmWindows(farm: Farm): void {
    getFarmWindows().forEach((farmWindow: FarmWindow) => {
        if (farmWindow.id === farm.id) {
            for (let i = 0; i < farmWindow.windows.length; i++) {
                farmWindow.windows[i].show();
            }
        }
    });
}

/**
 * Hide all windows of the specified farm.
 *
 * @param {Farm} farm Farm to hide all the windows.
 */
export function hideFarmWindows(farm: Farm): void {
    getFarmWindows().forEach((farmWindow: FarmWindow) => {
        if (farmWindow.id === farm.id) {
            for (let i = 0; i < farmWindow.windows.length; i++) {
                farmWindow.windows[i].hide();
            }
        }
    });
}

/**
 * Routinely checks if there are any windows for the specified farm left.
 * If not, sends the idle signal to renderer.
 *
 * @param {Farm} farm Farm to check the windows for.
 */
export function checkIfNoWindows(farm: Farm): boolean {
    let noWindows: boolean = false;

    getFarmWindows().forEach((farmWindow: FarmWindow) => {
        if (farmWindow.id === farm.id) {
            if (farmWindow.windows.length === 0)
                noWindows = true;
            else
                noWindows = false;
        }
    });

    return noWindows;
}

/**
 * Close the specified browser window.
 *
 * @param {Electron.BrowserWindow} window The browser window to close.
 */
export function closeWindow(window: Electron.BrowserWindow): void {
    window.destroy();
}