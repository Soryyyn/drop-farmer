import { BrowserWindow } from "electron";
import { resolve } from "path";
import { getPage } from "puppeteer-in-electron";
import { getApplicationSettings } from "../config";
import { getFarms } from "../farms/management";
import type FarmTemplate from "../farms/template";
import { log } from "../util/logger";
import { getBrowserConnection } from "../util/puppeteer";

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
 * To control wether the app is quitting or just the "closing" the main window.
 */
let appQuitting: boolean = false;

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
            devTools: !isProd,
            sandbox: false
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
        if (getApplicationSettings().showMainWindowOnLaunch) {
            log("MAIN", "DEBUG", `Created main window (shown) ${(!isProd ? "in dev mode" : "")}`);
            mainWindow.show();
            mainWindow.focus();
        } else {
            log("MAIN", "DEBUG", `Created main window (hidden) ${(!isProd ? "in dev mode" : "")}`);
        }
    });

    /**
     * When close button on main windows is clicked.
     * Prevent default electron action from close.
     */
    mainWindow.on("close", (event) => {
        event.preventDefault();
        if (!appQuitting) {
            hideWindow(mainWindow, true);

            /**
             * Hide all farm windows as well.
             */
            getFarms().forEach((farm: FarmTemplate) => {
                farm.hideAllWindows();
            })
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
export async function createWindow(url: string, gameName?: string) {
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

    /**
     * Mute window.
     */
    muteWindow(window);

    /**
     * Changed loading of url to puppeteer to hopefully prevent errors.
     */
    let page = await getPage(getBrowserConnection(), window, true);
    await page.goto(url);

    /**
     * Decide if the windows is for a farm or just a general window.
     */
    if (gameName)
        log("MAIN", "DEBUG", `Created window for \"${gameName}\"`);
    else
        log("MAIN", "DEBUG", "Created general window");
    return window;
}


/**
 * Destroy the wanted window.
 *
 * @param {Electron.BrowserWindow} window The window to destroy.
 */
export function destroyWindow(window: Electron.BrowserWindow): void {
    log("MAIN", "DEBUG", `Destroyed window(${window.id})`);
    window.destroy();
}

/**
 * Show the wanted window.
 *
 * @param {Electron.BrowserWindow} window The window to show.
 * @param {boolean} isMainWindow If the window is the main application window.
 */
export function showWindow(window: Electron.BrowserWindow, isMainWindow: boolean): void {
    log("MAIN", "DEBUG", `Showing window ${isMainWindow ? "(main)" : "(" + window.id + ")"}`)
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
    log("MAIN", "DEBUG", `Hidding window ${isMainWindow ? "(main)" : "(" + window.id + ")"}`)
    window.hide();
}

/**
 * Mute the wanted window.
 *
 * @param {Electron.BrowserWindow} window The window to mute.
 */
function muteWindow(window: Electron.BrowserWindow): void {
    log("MAIN", "DEBUG", `Muted window(${window.id})`);
    window.webContents.setAudioMuted(true);
}

/**
 * Reload the given window.
 *
 * @param {Electron.BrowserWindow} window The window to reload.
 */
export function reloadWindow(window: Electron.BrowserWindow): void {
    log("MAIN", "DEBUG", `Reloaded window(${window.id})`);
    window.reload();
}

/**
 * Determine wether the app is quitting or just closing.
 *
 * @param {boolean} quitting The new quitting status.
 */
export function setAppQuitting(quitting: boolean): void {
    appQuitting = quitting;
}