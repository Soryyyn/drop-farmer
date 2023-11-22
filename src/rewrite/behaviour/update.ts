import { app, autoUpdater } from 'electron';
import { TASK_QUEUE_HIGH_PRIO } from '../util/constants';
import { isPlatformLinux, isRunningOnProd } from '../util/environment';
import { LogLevel, log } from '../util/logging';
import { addToQueue } from '../util/taskQueue';
import { handleBeforeQuit } from './app';
import { IPCChannel, handleFromRenderer, sendToRenderer } from './ipc';

/**
 * The UR: the updater goes to, to check if an update is available.
 */
autoUpdater.setFeedURL({
    url: `https://drop-farmer-release-server.vercel.app/update/${
        process.platform
    }/${app.getVersion()}`
});

/**
 * Check if the current build can auto update (means the user is probably
 * running linux).
 */
export function canAutoUpdate() {
    return !isPlatformLinux();
}

export function updateCheck() {
    if (!isRunningOnProd()) {
        log(
            LogLevel.Warn,
            'Checking for updates not possible when not running production build'
        );
        return;
    }

    /**
     * TODO: If auto-updating is not possible, still notify renderer and make the user
     * redirect to the downloads page.
     */

    autoUpdater.checkForUpdates();
}

// TODO: add toast notifications and IPC events.

function handleCheckForUpdate() {
    log(LogLevel.Info, 'Checking if an update is available');
}

function handleNoUpdateAvailable() {
    log(LogLevel.Info, 'New update not available');
    sendToRenderer(IPCChannel.UpdateStatus, false);
}

function handleUpdateAvailable() {
    log(LogLevel.Info, 'Update available');
    sendToRenderer(IPCChannel.UpdateStatus, false);

    log(LogLevel.Info, 'Downloading update...');
}

function handleUpdateFinishedDownload() {
    log(LogLevel.Info, 'Finished download of update and ready to install');
}

function handleInstallOfUpdate() {
    log(LogLevel.Info, 'Starting install of update');
    handleBeforeQuit();
}

function handleErrorOnUpdateProcess(error: Error) {
    log(
        LogLevel.Error,
        `Error when checking/downloading/installing update, error: ${error}`
    );
    sendToRenderer(IPCChannel.UpdateStatus, false);
}

/**
 * Updater event listeners.
 */
autoUpdater.on('checking-for-update', handleCheckForUpdate);
autoUpdater.on('update-not-available', handleNoUpdateAvailable);
autoUpdater.on('update-available', handleUpdateAvailable);
autoUpdater.on('update-downloaded', handleUpdateFinishedDownload);
autoUpdater.on('before-quit-for-update', handleInstallOfUpdate);
autoUpdater.on('error', handleErrorOnUpdateProcess);

/**
 * If the user manually want's to check for updates.
 */
handleFromRenderer(IPCChannel.CheckForUpdate, () =>
    addToQueue(updateCheck, TASK_QUEUE_HIGH_PRIO)
);
