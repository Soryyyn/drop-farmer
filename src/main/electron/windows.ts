import { getWindowIcon } from '@main/util/icons';
import { log } from '@main/util/logging';
import { getBrowserConnection, gotoURL } from '@main/util/puppeteer';
import { getSettingValue } from '@main/util/settings';
import { BrowserWindow } from 'electron';
import { getPage } from 'puppeteer-in-electron';

/**
 * Pick up constant from electron-forge for the main window entry and the
 * preload file entry.
 * Depends on production and development.
 */
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

/**
 * All of the windows.
 */
let mainWindow: BrowserWindow;
const windows: BrowserWindow[] = [];

/**
 * Default created window options.
 */
const DefaultWindowOptions = {
    icon: getWindowIcon(),
    center: true,
    show: false,
    closable: false,
    webPreferences: {
        devTools: !(process.env.NODE_ENV === 'production')
    }
};

/**
 * Create the main app window.
 */
export function createMainWindow(): Promise<void> {
    return new Promise(async (resolve) => {
        mainWindow = new BrowserWindow({
            ...DefaultWindowOptions,
            show: process.platform === 'linux' ? true : false,
            title: 'drop-farmer',
            height: 800,
            width: 1200,
            maximizable: false,
            resizable: false,
            autoHideMenuBar: true,
            titleBarStyle: 'hidden',
            titleBarOverlay: {
                color: '#c8def5',
                symbolColor: '#000000'
            },
            webPreferences: {
                preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
                sandbox: false
            }
        });

        mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

        /**
         * When window is ready.
         */
        mainWindow.on('ready-to-show', () => {
            const shouldBeShownBySetting = getSettingValue(
                'application',
                'application-showMainWindowOnLaunch'
            ) as boolean;

            /**
             * Show the window if the setting is set or the app is run on linux.
             */
            if (shouldBeShownBySetting || process.platform === 'linux') {
                mainWindow.show();
                mainWindow.focus();
            }

            log('info', 'Created main window');
            resolve();
        });

        /**
         * Prevent the app from shutting down.
         * Also hide all windows if the close event is fired.
         */
        mainWindow.on('close', (event) => {
            event.preventDefault();

            mainWindow.hide();
            windows.forEach((window) => window.hide());
        });
    });
}

/**
 * Create a window for the app.
 */
export function createWindow(
    url: string,
    shown: boolean
): Promise<BrowserWindow> {
    return new Promise(async (resolve) => {
        const window = new BrowserWindow({
            ...DefaultWindowOptions,
            height: 1080,
            width: 1920
        });

        /**
         * Push it into the windows array.
         */
        windows.push(window);

        /**
         * Mute the window.
         */
        window.webContents.setAudioMuted(true);

        /**
         * Goto the wanted url.
         */
        window.loadURL(url);

        /**
         * Resolve the creationg once the dom or the window is ready.
         *
         */
        window.webContents.on('dom-ready', () => {
            if (shown) {
                window.show();
            }

            log('info', `Created window:${window.id}`);
            resolve(window);
        });
    });
}

/**
 * Destroy the window and remove it from the array.
 */
export function destroyWindow(windowToDestroy: BrowserWindow): Promise<void> {
    return new Promise(async (resolve) => {
        /**
         * Remove it from the windows array.
         */
        windows.splice(
            windows.findIndex((window) => window === windowToDestroy),
            1
        );

        log('info', `Destroying window:${windowToDestroy.id}`);
        windowToDestroy.destroy();

        resolve();
    });
}

/**
 * Destroy all the windows left in the windows array.
 */
export function destroyAllWindowsLeft(): Promise<void> {
    return new Promise(async (resolve) => {
        /**
         * Destroy the main window.
         */
        await destroyMainWindow();

        /**
         * Destroy each window.
         */
        windows.forEach(async (window) => await destroyWindow(window));

        /**
         * Check if there are windows left there and destroy them all again.
         */
        if (windows.length === 0) {
            resolve();
        }

        destroyAllWindowsLeft();
        resolve();
    });
}

/**
 * Destroy the main window.
 */
async function destroyMainWindow(): Promise<void> {
    await destroyWindow(mainWindow);
    log('info', 'Destroyed main window');
}

/**
 * Show a window.
 */
export function showWindow(window: BrowserWindow): void {
    try {
        if (window) {
            window.show();
            window.focus();
            log('info', `Showing window:${window.id}`);
        }
    } catch (error) {
        log('error', `Couldn't show window:${window.id}, reason: ${error}`);
    }
}

/**
 * Hide a window.
 */
export function hideWindow(window: BrowserWindow): void {
    try {
        if (window) {
            window.hide();
            log('info', `Hidden window:${window.id}`);
        }
    } catch (error) {
        log('error', `Couldn't show window:${window.id}, reason: ${error}`);
    }
}

/**
 * Get the native window handle for the shutdown handler.
 */
export function getMainWindowNativeHandle(): Buffer {
    return mainWindow.getNativeWindowHandle();
}

/**
 * Get the main window.
 */
export function getMainWindow(): BrowserWindow {
    return mainWindow;
}
