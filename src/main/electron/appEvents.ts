import { initFarmsManagement, stopFarms } from '@main/farming/management';
import { log } from '@main/util/logging';
import ElectronShutdownHandler from '@paymoapp/electron-shutdown-handler';
import { app } from 'electron';
import { handleClientShutdown } from './shutdownHandler';
import { createTray, destroyTray } from './tray';
import { initUpdater } from './update';
import { createMainWindow } from './windows';

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
export function handleAppReady(): void {
    initUpdater();
    initFarmsManagement();

    createTray();
    createMainWindow();
    handleClientShutdown();

    log('warn', 'Ready finished');
}

/**
 * Handle the state before app quits.
 */
export async function handleAppBeforeQuit(
    event?: Electron.Event
): Promise<void> {
    /**
     * Wait for cleanup to finish before actually quitting.
     */
    if (!finishedBeforeQuit) {
        if (event) event.preventDefault();

        await stopFarms();
        destroyTray();

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
 * Handle the app quit event.
 */
export function handleAppQuit(): void {
    log('warn', 'Quit finished');
}
