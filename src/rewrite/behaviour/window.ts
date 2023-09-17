import { BrowserWindow } from 'electron';
import isEqual from 'lodash.isequal';
import {
    DEFAULT_MAIN_WINDOW_HEIGHT,
    DEFAULT_MAIN_WINDOW_WIDTH,
    MAIN_WINDOW_INDEX
} from '../util/constants';
import { isRunningOnProd } from '../util/environment';
import { getWindowIcon } from '../util/getWindowIcon';
import { LogLevel, log } from '../util/logging';

/**
 * Needed for forge to build the window with webpack.
 */
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

/**
 * All the windows of the app.
 * NOTE: The main window will always be on index 0.
 */
const windows: BrowserWindow[] = [];

export function createMainWindow(visible: boolean = false) {
    const window = new BrowserWindow({
        icon: getWindowIcon(),
        center: true,
        show: false, // NOTE: inital show state, will later get shown depending on `visible`.
        title: 'Drop Farmer',
        width: DEFAULT_MAIN_WINDOW_WIDTH,
        height: DEFAULT_MAIN_WINDOW_HEIGHT,
        autoHideMenuBar: true,
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#c8def5',
            symbolColor: '#000000'
        },
        webPreferences: {
            backgroundThrottling: true,
            devTools: !isRunningOnProd(),
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
            additionalArguments: ['--single-process', '--disable-gpu']
        }
    });

    window.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    /**
     * Once the window has finished it's setup things.
     */
    window.on('ready-to-show', () => {
        /**
         * Set the main window at index MAIN_WINDOW_INDEX.
         */
        windows[MAIN_WINDOW_INDEX] = window;

        if (visible) {
            showWindow(window);
        }

        log(LogLevel.Info, `Created main window at index ${MAIN_WINDOW_INDEX}`);
    });
}

export function createNormalWindow(
    urlToLoad: string,
    visible: boolean = false
) {
    const window = new BrowserWindow({
        icon: getWindowIcon(),
        center: true,
        show: false, // NOTE: inital show state, will later get shown depending on `visible`.
        width: 1024,
        height: 720,
        webPreferences: {
            backgroundThrottling: true,
            devTools: !isRunningOnProd(),
            sandbox: false,
            additionalArguments: [
                /**
                 * These arguments limit some memory, etc. usage by the windows
                 * to make the app less expensive to run while doing some heavy
                 * work somewhere else.
                 *
                 * Some args described:
                 * - Disable GPU acceleration
                 * - Limit the window to run on one singular process (chromium
                 *   usally splits into multiple processes)
                 */
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ]
        }
    });

    /**
     * Mute the window and also load the given URL.
     */
    window.webContents.setAudioMuted(true);
    window.loadURL(urlToLoad);

    /**
     * Once the DOM has finished loading, resolve the window.
     */
    window.webContents.on('dom-ready', () => {
        const newLengthOfWindows = windows.push(window);

        if (visible) {
            showWindow(window);
        }

        log(
            LogLevel.Info,
            `Created new window (index at ${newLengthOfWindows - 1})`
        );
    });
}

/**
 * Get the `BrowserWindow` object by either a window or the index.
 */
export function getWindow(
    windowOrIndex: BrowserWindow | number = MAIN_WINDOW_INDEX
) {
    if (typeof windowOrIndex === 'number') return windows[windowOrIndex];
    return windows.find((window) => isEqual(window, windowOrIndex));
}

export function getWindowIndex(window: BrowserWindow) {
    return windows.findIndex((createdWindow) => createdWindow === window);
}

export function destroyWindow(
    windowOrIndex: BrowserWindow | number = MAIN_WINDOW_INDEX
) {
    const window = getWindow(windowOrIndex);

    if (canWindowBeDestroyed(window)) {
        const index = getWindowIndex(window!);

        windows.splice(index, 1);
        window!.destroy();

        log(LogLevel.Info, `Destroyed window at index ${index}`);
    }
}

export function destroyAllWindows() {
    windows.forEach((window) => destroyWindow(window));
}

export function showWindow(window: BrowserWindow | undefined): void {
    if (canWindowBeShown(window)) {
        window!.center();
        window!.show();
        window!.focus();

        log(
            LogLevel.Info,
            `Showing window at index ${getWindowIndex(window!)}`
        );
    }
}

export function hideWindow(window: BrowserWindow | undefined): void {
    if (canWindowBeHidden(window)) {
        window!.hide();
        log(LogLevel.Info, `Hiding window at index ${getWindowIndex(window!)}`);
    }
}

/**
 * Because this will always be called when the window is already defined, this
 * can be forced to be defined.
 */
export function getMainWindowNativeHandle() {
    return getWindow()!.getNativeWindowHandle();
}

function canWindowBeDestroyed(window: BrowserWindow | undefined) {
    if (!window || window.isDestroyed()) return false;
    return true;
}

function canWindowBeShown(window: BrowserWindow | undefined) {
    if (!window || window.isDestroyed()) return false;
    else if (window.isVisible()) return false;
    else return true;
}

function canWindowBeHidden(window: BrowserWindow | undefined) {
    if (!window || window.isDestroyed()) return false;
    else if (window.isVisible()) return true;
    else return false;
}
