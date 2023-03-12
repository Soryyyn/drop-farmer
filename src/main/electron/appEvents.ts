import { LaunchArgs } from '@main/common/constants';
import { initFarmsManagement, stopFarms } from '@main/farming/management';
import { log } from '@main/util/logging';
import ElectronShutdownHandler from '@paymoapp/electron-shutdown-handler';
import {
    app,
    autoUpdater,
    RenderProcessGoneDetails,
    WebContents
} from 'electron';
import { requestSingleInstanceLock } from './instanceLock';
import { handleClientShutdown } from './shutdownHandler';
import { createTray, destroyTray } from './tray';
import {
    createMainWindow,
    destroyAllWindowsLeft,
    getMainWindow,
    isMainWindowShown,
    showWindow
} from './windows';

/**
 * The variable to check if the app really want's to quit.
 */
let isQuitting: boolean = false;
let finishedBeforeQuit: boolean = false;

/**
 * Set the app state to quitting.
 */
export function setIsQuitting(): void {
    isQuitting = true;
}

export function getIsQuitting(): boolean {
    return isQuitting;
}

/**
 * Handle the app ready state.
 */
export async function handleAppReady(): Promise<void> {
    /**
     * Check the single instance lock.
     * Quit the new instance if a lock is already set.
     */
    if (process.env.NODE_END === 'production') {
        if (!requestSingleInstanceLock()) {
            log(
                'warn',
                'Hard exiting app because another instance is already running'
            );
            process.exit();
        }
    }

    /**
     * Set the user model id.
     */
    app.setAppUserModelId('com.squirrel.soryn.DropFarmer');

    initFarmsManagement();
    createTray();
    await createMainWindow();
    handleClientShutdown();

    /**
     * Show if window should be shown by relaunch.
     */
    if (process.argv.find((arg) => arg === LaunchArgs.ShowMainWindow)) {
        showWindow(getMainWindow());
        log('info', 'Showing main window because it was shown before relaunch');
    }

    log('warn', 'Ready finished');
}

/**
 * Handle the state before app quits.
 */
export function handleAppBeforeQuit(event?: Electron.Event): void {
    /**
     * Wait for cleanup to finish before actually quitting.
     */
    if (!finishedBeforeQuit) {
        if (event) event.preventDefault();

        destroyTray();
        stopFarms();
        destroyAllWindowsLeft();

        finishedBeforeQuit = true;
        isQuitting = true;

        /**
         * Release the shutdown.
         */
        ElectronShutdownHandler.releaseShutdown();

        log('warn', 'Before quit finished');
        app.quit();
    }
}

/**
 * Handle the quit for the update.
 */
export function handleQuitForUpdate(): void {
    autoUpdater.quitAndInstall();
}

/**
 * Handle the app quit event.
 */
export function handleAppQuit(): void {
    log('warn', 'Quit finished');
}

/**
 * Handle the client going to sleep.
 */
export async function handlePCSleep(): Promise<void> {
    log('warn', 'PC went to sleep');
}

/**
 * Handle the client waking back up.
 */
export async function handlePCWakeUp(): Promise<void> {
    log('warn', 'PC woke up');

    relaunchApp([isMainWindowShown() ? LaunchArgs.ShowMainWindow : '']);
}

/**
 * Handle the event when a renderer process crashes.
 */
export async function handleRendererProcessGone(
    event: Electron.Event,
    webContents: WebContents,
    details: RenderProcessGoneDetails
) {
    log(
        'error',
        `Renderer ${webContents.id} gone, reason: ${details.reason} with exit code ${details.exitCode}. Relaunching app`
    );

    relaunchApp();
}

/**
 * Relaunch the app with args.
 */
function relaunchApp(args?: string[]): void {
    log('warn', 'Relaunching app');

    isQuitting = true;
    app.relaunch({ args: args });

    handleAppBeforeQuit();
}

/**
 * If a new instance has been opened, open the main window.
 */
export function handleSecondInstanceOpened(): void {
    if (process.env.NODE_ENV === 'production') {
        showWindow(getMainWindow());
        log('info', 'Showing main window because second instance triggered');
    }
}
