import { getFarms } from '@main/farming/management';
import FarmTemplate from '@main/farming/template';
import { log } from '@main/util/logging';
import { getBrowserConnection, gotoURL } from '@main/util/puppeteer';
import { app, BrowserWindow } from 'electron';
import { resolve } from 'path';
import { getPage } from 'puppeteer-in-electron';
import { getSettingValue } from '../util/settings';

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
 * Creates the main window.
 */
export function createMainWindow(): void {
    mainWindow = new BrowserWindow({
        icon: resolve(
            __dirname,
            `resources/icon.${process.platform != 'linux' ? 'ico' : 'png'}`
        ),
        height: 800,
        width: 1200,
        center: true,
        maximizable: false,
        resizable: false,
        show: process.platform === 'linux' ? true : false,
        title: 'drop-farmer',
        autoHideMenuBar: true,
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#c8def5',
            symbolColor: '#000000'
        },
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
            devTools: process.env.NODE_ENV === 'development',
            sandbox: false
        }
    });

    /**
     * Load the react app into the main window.
     */
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    /**
     * Show when the window is ready.
     */
    mainWindow.on('ready-to-show', () => {
        if (
            (getSettingValue(
                'application',
                'application-showMainWindowOnLaunch'
            )! as boolean) ||
            process.platform === 'linux'
        ) {
            log(
                'info',
                `Created main window (shown) ${
                    process.env.NODE_ENV === 'development' ? 'in dev mode' : ''
                }`
            );
            mainWindow.show();
            mainWindow.focus();
        } else {
            log(
                'info',
                `Created main window (hidden) ${
                    process.env.NODE_ENV === 'development' ? 'in dev mode' : ''
                }`
            );
        }
    });

    /**
     * When close button on main windows is clicked.
     * Prevent default electron action from close.
     */
    mainWindow.on('close', (event) => {
        event.preventDefault();
        if (!appQuitting) {
            hideWindow(mainWindow, true);

            /**
             * Hide all farm windows as well.
             */
            getFarms().forEach((farm: FarmTemplate) => {
                farm.toggleWindowsVisibility(false);
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
 */
export async function createWindow(url: string, shouldBeShown: boolean) {
    const window = new BrowserWindow({
        icon: resolve(
            __dirname,
            `resources/icon.${process.platform != 'linux' ? 'ico' : 'png'}`
        ),
        height: 1080,
        width: 1920,
        show: false,
        closable: false,
        webPreferences: {
            devTools: !(process.env.NODE_ENV === 'production')
        }
    });

    /**
     * Mute window.
     */
    await muteWindow(window);

    /**
     * Load the url.
     * (Reloading to route for safety)
     */
    await window.loadURL(url);
    const page = await getPage(getBrowserConnection(), window);
    await gotoURL(page, url);

    window.on('ready-to-show', () => {
        if (
            shouldBeShown ||
            (getSettingValue('application', 'showWindowsForLogin')! as boolean)
        ) {
            window.show();
        }
    });

    log('info', 'Created window');
    return window;
}

/**
 * Destroy the wanted window.
 *
 * @param {Electron.BrowserWindow} window The window to destroy.t
 */
export function destroyWindow(window: Electron.BrowserWindow): Promise<void> {
    return new Promise((resolve) => {
        window.destroy();

        window.on('closed', async () => {
            if (!window.isDestroyed()) {
                await destroyWindow(window);
            } else {
                log('info', `Destroyed window(${window.id})`);
                resolve();
            }
        });
    });
}

/**
 * Show the wanted window.
 *
 * @param {Electron.BrowserWindow} window The window to show.
 * @param {boolean} isMainWindow If the window is the main application window.
 */
export function showWindow(
    window: Electron.BrowserWindow,
    isMainWindow: boolean
): void {
    log(
        'info',
        `Showing window ${isMainWindow ? '(main)' : '(' + window.id + ')'}`
    );

    window.show();
    window.focus();
}

/**
 * Hide the wanted window.
 *
 * @param {Electron.BrowserWindow} window The window to show.
 * @param {boolean} isMainWindow If the window is the main application window.
 */
export function hideWindow(
    window: Electron.BrowserWindow,
    isMainWindow: boolean
): void {
    log(
        'info',
        `Hidding window ${isMainWindow ? '(main)' : '(' + window.id + ')'}`
    );

    window.hide();
}

/**
 * Mute the wanted window.
 *
 * @param {Electron.BrowserWindow} window The window to mute.
 */
function muteWindow(window: Electron.BrowserWindow): Promise<void> {
    return new Promise((resolve) => {
        log('info', `Muted window(${window.id})`);
        window.webContents.setAudioMuted(true);
        resolve();
    });
}

/**
 * Determine wether the app is quitting or just closing.
 *
 * @param {boolean} quitting The new quitting status.
 */
export function setAppQuitting(quitting: boolean): void {
    appQuitting = quitting;
}

/**
 * Listen for window closing.
 */
app.on('render-process-gone', (event, webContents, details) => {
    log(
        'warn',
        `Renderer ${webContents.id} gone, reason: ${details.reason} with exit code ${details.exitCode}`
    );
});
