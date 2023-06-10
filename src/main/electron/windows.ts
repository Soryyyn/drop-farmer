import { SettingId, ToggleSetting } from '@df-types/settings.types';
import { getSettingValue } from '@main/store/settings';
import { getWindowIcon } from '@main/util/icons';
import { log } from '@main/util/logging';
import { BrowserWindow, Event } from 'electron';
import { getIsQuitting } from './appEvents';

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
let mainWindow: BrowserWindow | undefined;
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
        devTools: !(process.env.NODE_ENV === 'production'),
        sandbox: false
    }
};

/**
 * Create the main app window.
 */
export function createMainWindow(): void {
    mainWindow = new BrowserWindow({
        ...DefaultWindowOptions,
        show: process.platform === 'linux' ? true : false,
        title: 'Drop Farmer',
        height: 800,
        width: 1200,
        maximizable: false,
        resizable: false,
        closable: true,
        autoHideMenuBar: true,
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#c8def5',
            symbolColor: '#000000'
        },
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
        }
    });

    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    /**
     * When window is ready.
     */
    mainWindow.on('ready-to-show', () => {
        const shouldBeShownBySetting = getSettingValue<ToggleSetting>(
            'Application',
            SettingId.ShowMainWindowOnLaunch
        );

        /**
         * Show the window if the setting is set or the app is run on linux.
         */
        if (shouldBeShownBySetting || process.platform === 'linux') {
            showWindow(mainWindow!);
        }

        log('info', 'Created main window');
    });

    /**
     * Prevent the app from shutting down.
     * Also hide all windows if the close event is fired.
     */
    mainWindow.on('close', (event) => {
        if (!getIsQuitting()) {
            event.preventDefault();

            hideWindow(mainWindow!);
            windows.forEach((window) => {
                if (canWindowBeHidden(window)) hideWindow(window);
            });

            log('info', 'Hidden main and all other windows');
        }
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
            width: 1920,
            closable: true
        });

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
            windows.push(window);

            if (shown) {
                window.show();
            }

            log('info', `Created window:${window.id}`);
            resolve(window);
        });

        /**
         * Prevent the manual user close.
         */
        window.on('close', (event) => {
            if (!getIsQuitting()) {
                event.preventDefault();
                hideWindow(window);
            }
        });
    });
}

/**
 * Destroy the window and remove it from the array.
 */
export function destroyWindow(windowToDestroy: BrowserWindow | undefined) {
    if (canWindowBeDestroyed(windowToDestroy)) {
        windows.splice(
            windows.findIndex((window) => window === windowToDestroy),
            1
        );

        windowToDestroy!.destroy();
        log('info', 'Destroyed window');
    }
}

/**
 * Destroy all the windows left in the windows array.
 */
export function destroyAllWindowsLeft(): void {
    /**
     * Destroy the main window.
     */
    destroyMainWindow();

    /**
     * Destroy each window.
     */
    windows.forEach((window) => destroyWindow(window));
}

/**
 * Destroy the main window.
 */
function destroyMainWindow(): void {
    if (canWindowBeDestroyed(mainWindow)) {
        destroyWindow(mainWindow);
        mainWindow = undefined;
        log('info', 'Destroyed main window');
    }
}

/**
 * Show a window.
 */
export function showWindow(window: BrowserWindow): void {
    if (canWindowBeShown(window)) {
        window.show();
        window.focus();
        log('info', `Showing window:${window.id}`);
    }
}

/**
 * Hide a window.
 */
export function hideWindow(window: BrowserWindow): void {
    if (canWindowBeHidden(window)) {
        window.hide();
        log('info', `Hidden window:${window.id}`);
    }
}

/**
 * Get the native window handle for the shutdown handler.
 */
export function getMainWindowNativeHandle(): Buffer {
    return mainWindow!.getNativeWindowHandle();
}

/**
 * Get the main window.
 */
export function getMainWindow(): BrowserWindow {
    return mainWindow!;
}

/**
 * Check if the main window is shown/visible.
 */
export function isMainWindowShown(): boolean {
    return mainWindow!.isVisible();
}

/**
 * Check if a window can be destroyed.
 */
function canWindowBeDestroyed(window: BrowserWindow | undefined): boolean {
    if (window === undefined || window.isDestroyed()) return false;
    return true;
}

/**
 * Check if a window can be shown.
 */
function canWindowBeShown(window: BrowserWindow | undefined): boolean {
    if (window === undefined || window.isDestroyed()) return false;
    else if (window.isVisible()) return false;
    else return true;
}

/**
 * Check if a window can be hidden
 */
function canWindowBeHidden(window: BrowserWindow | undefined): boolean {
    if (window === undefined || window.isDestroyed()) return false;
    else if (window.isVisible()) return true;
    else return false;
}
