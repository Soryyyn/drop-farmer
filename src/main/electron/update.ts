import { IpcChannels, LaunchArgs, Toasts } from '@main/common/constants';
import { log } from '@main/util/logging';
import { sendToast } from '@main/util/toast';
import { app, autoUpdater } from 'electron';
import { handleAppBeforeQuit } from './appEvents';
import { sendOneWay } from './ipc';

/**
 * Set the update feed url.
 */
autoUpdater.setFeedURL({
    url: `https://drop-farmer-release-server.vercel.app/update/${
        process.platform
    }/${app.getVersion()}`
});

/**
 * Check if its the apps first run after an update or install.
 */
function isFirstRunAfterUpdate(): boolean {
    return process.argv.indexOf(LaunchArgs.SquirrelFirstRun) > -1;
}

/**
 * Check if the app can update.
 */
export function checkIfCanUpdate(): void {
    if (isFirstRunAfterUpdate()) {
        sendToast({
            toast: {
                id: Toasts.UpdateChecking,
                type: 'error',
                duration: 4000,
                textOnError:
                    "Can't check for update on the first of the app. Please restart Drop Farmer."
            }
        });
    } else if (process.env.NODE_ENV === 'development') {
        sendToast({
            toast: {
                id: Toasts.UpdateChecking,
                type: 'error',
                duration: 4000,
                textOnError:
                    "Can't check for update while in development environment."
            }
        });
    } else {
        autoUpdater.checkForUpdates();
    }
}

/**
 * Handle when the user want's to install the update manually.
 */
export function handleInstallOfUpdate(): void {
    autoUpdater.quitAndInstall();
}

/**
 * Handle when the updater checks for updates.
 */
function handleUpdateCheck(): void {
    log('info', 'Checking if update is available');

    sendToast({
        toast: {
            id: Toasts.UpdateChecking,
            type: 'loading',
            duration: Infinity,
            textOnLoading: 'Checking if an update is available...'
        }
    });
}

/**
 * Handle when no update is available.
 */
function handleUpdateNotAvailable(): void {
    log('info', 'No update available');

    /**
     * Update the update status in the renderer.
     */
    sendOneWay(IpcChannels.updateStatus, false);

    sendToast({
        toast: {
            id: Toasts.UpdateChecking,
            type: 'error',
            duration: 4000,
            textOnError: 'No update available.'
        }
    });
}

/**
 * Handle when an update is available and found.
 * The updater also automatically updates it.
 */
function handleUpdateAvailable(): void {
    log('info', 'Update is available, currently downloading...');

    sendToast({
        toast: {
            id: Toasts.UpdateChecking,
            type: 'loading',
            duration: Infinity,
            textOnLoading: 'Update available, downloading...'
        }
    });
}

/**
 * When the update has finished downloading.
 */
function handleUpdateDownloaded(): void {
    log('info', 'Update has finished downloading and is installable');

    /**
     * Notify renderer.
     */
    sendOneWay(IpcChannels.updateStatus, true);

    sendToast({
        toast: {
            id: Toasts.UpdateChecking,
            type: 'success',
            duration: 4000,
            textOnSuccess: 'Update downloaded and ready to install.'
        }
    });
}

/**
 * When the user want's to manually quit the app to install the update.
 */
function handleBeforeQuitForUpdate(): void {
    log(
        'info',
        'User activated installation of update, handling the before quit event here.'
    );

    handleAppBeforeQuit();
}

/**
 * When the auto updater encounters a problem in the update process.
 */
function handleErrorOnUpdate(error: Error): void {
    log('error', `Failed downloading / installing update. ${error}`);

    /**
     * Notify renderer.
     */
    sendOneWay(IpcChannels.updateStatus, false);

    sendToast({
        toast: {
            id: Toasts.UpdateChecking,
            type: 'error',
            duration: 4000,
            textOnError:
                'Error occured while checking for update. Please check the logfile.'
        }
    });
}

/**
 * The auto-updater listeners.
 */
autoUpdater.on('checking-for-update', handleUpdateCheck);
autoUpdater.on('update-not-available', handleUpdateNotAvailable);
autoUpdater.on('update-available', handleUpdateAvailable);
autoUpdater.on('update-downloaded', handleUpdateDownloaded);
autoUpdater.on('before-quit-for-update', handleBeforeQuitForUpdate);
autoUpdater.on('error', handleErrorOnUpdate);
